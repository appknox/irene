import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { debounceTask } from 'ember-lifeline';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import parseError from 'irene/utils/parse-error';
import type OffsecScanModel from 'irene/models/offsec-scan';
import type PollService from 'irene/services/poll';

export type PlatformFilter = 'all' | 'android' | 'ios';

export type ResilienceFilter =
  | 'all'
  | 'weak'
  | 'medium'
  | 'strong'
  | 'very-strong';

export type StatusFilter =
  | 'all'
  | 'running'
  | 'queued'
  | 'completed'
  | 'failed'
  | 'not_started';

export type SortDirection = 'asc' | 'desc';

type ScanResponseModel = DS.AdapterPopulatedRecordArray<OffsecScanModel> & {
  meta?: { count: number };
};

export interface OffensiveSecurityAttackRunsQueryParams {
  scan_limit?: number;
  scan_offset?: number;
  scan_query?: string;
  scan_platform?: PlatformFilter;
  scan_resilience?: ResilienceFilter;
  scan_sort?: SortDirection;
}

const DEFAULT_LIMIT = 25;
const SEARCH_DEBOUNCE_MS = 500;

/** Poll while any run is still going; the websocket is the primary signal. */
const POLL_INTERVAL_MS = 5000;

export interface OffensiveSecurityAttackRunsSignature {
  Args: {
    queryParams?: OffensiveSecurityAttackRunsQueryParams;
  };
}

export default class OffensiveSecurityAttackRunsComponent extends Component<OffensiveSecurityAttackRunsSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;
  @service declare poll: PollService;

  @tracked scans: OffsecScanModel[] = [];
  @tracked totalCount = 0;

  /**
   * The search box is the one control that cannot read straight from the URL:
   * AkTextField two-way binds `@value`, so it needs a settable property. Seeded
   * from the query param so a shared link still lands with the box filled in.
   */
  @tracked searchQuery = this.args.queryParams?.scan_query ?? '';

  stopPolling?: () => void;

  constructor(
    owner: unknown,
    args: OffensiveSecurityAttackRunsSignature['Args']
  ) {
    super(owner, args);

    this.loadScans.perform();
  }

  willDestroy(): void {
    super.willDestroy();

    this.stopPolling?.();
  }

  // ─── Query-param backed state ──────────────────────────────────────────────
  // Filters, search, sort and paging all live in the URL so a filtered view is
  // shareable and survives a reload or a back navigation.

  get limit(): number {
    return Number(this.args.queryParams?.scan_limit ?? DEFAULT_LIMIT);
  }

  get offset(): number {
    return Number(this.args.queryParams?.scan_offset ?? 0);
  }

  get platformFilter(): PlatformFilter {
    return this.args.queryParams?.scan_platform ?? 'all';
  }

  get resilienceFilter(): ResilienceFilter {
    return this.args.queryParams?.scan_resilience ?? 'all';
  }

  get sortDirection(): SortDirection {
    return this.args.queryParams?.scan_sort ?? 'desc';
  }

  // ─── Derived view state ────────────────────────────────────────────────────

  get isLoading(): boolean {
    return this.loadScans.isRunning && this.scans.length === 0;
  }

  get hasNoScans(): boolean {
    return !this.isLoading && this.scans.length === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('fileID'),
        valuePath: 'targetFileId',
        width: 100,
      },
      {
        name: this.intl.t('platform'),
        component: 'offensive-security/attack-runs/table/platform',
        headerComponent: 'offensive-security/attack-runs/table/platform-header',
        width: 90,
      },
      {
        name: this.intl.t('offensiveSecurity.application'),
        component: 'offensive-security/attack-runs/table/target',
        minWidth: 160,
      },
      {
        name: this.intl.t('offensiveSecurity.package'),
        valuePath: 'packageName',
        minWidth: 180,
      },
      {
        name: this.intl.t('version'),
        valuePath: 'versionLabel',
        width: 110,
      },
      {
        name: this.intl.t('offensiveSecurity.exploitability'),
        component: 'offensive-security/attack-runs/table/resilience',
        headerComponent:
          'offensive-security/attack-runs/table/resilience-header',
        width: 140,
      },
      {
        name: this.intl.t('offensiveSecurity.runOn'),
        valuePath: 'scannedOnLabel',
        headerComponent: 'offensive-security/attack-runs/table/date-header',
        width: 130,
      },
      {
        name: this.intl.t('status'),
        component: 'offensive-security/attack-runs/table/status',
        headerComponent: 'offensive-security/attack-runs/table/status-header',
        width: 150,
      },
    ];
  }

  @tracked selectedStatusFilter: StatusFilter = 'all';

  @action
  handleStatusFilterChange(value: StatusFilter): void {
    this.selectedStatusFilter = value;
  }

  @tracked selectedStatusTab: 'all' | 'running' | 'completed' | 'failed' =
    'all';

  get runningCount(): number {
    return this.scans.filter((s) => s.isInProgress || s.isRunning).length;
  }

  get completedCount(): number {
    return this.scans.filter((s) => s.isCompleted).length;
  }

  get failedCount(): number {
    return this.scans.filter((s) => s.isFailed).length;
  }

  @action
  setStatusTab(tab: 'all' | 'running' | 'completed' | 'failed'): void {
    this.selectedStatusTab = tab;
  }

  /**
   * Filtering and sorting happen client-side over the loaded page. The API paginates,
   * so this narrows the current page rather than the whole history — enough for the
   * volumes this list shows, but it does mean a filter cannot reach across pages.
   */
  get filteredScans(): OffsecScanModel[] {
    const query = this.searchQuery.trim().toLowerCase();

    const rows = this.scans.filter((scan) => {
      const matchesSearch =
        !query ||
        scan.displayName.toLowerCase().includes(query) ||
        (scan.packageName && scan.packageName.toLowerCase().includes(query)) ||
        (scan.targetFileId &&
          String(scan.targetFileId).toLowerCase().includes(query));

      const matchesPlatform =
        this.platformFilter === 'all' || scan.platform === this.platformFilter;

      // Resilience is only scored once a run has finished.
      const matchesResilience =
        this.resilienceFilter === 'all' ||
        (scan.hasResilience && scan.resilienceClass === this.resilienceFilter);

      const matchesStatusTab =
        this.selectedStatusTab === 'all' ||
        (this.selectedStatusTab === 'running' &&
          (scan.isInProgress || scan.isRunning)) ||
        (this.selectedStatusTab === 'completed' && scan.isCompleted) ||
        (this.selectedStatusTab === 'failed' && scan.isFailed);

      const matchesStatusHeader =
        this.selectedStatusFilter === 'all' ||
        (this.selectedStatusFilter === 'running' &&
          (scan.isInProgress || scan.isRunning)) ||
        (this.selectedStatusFilter === 'queued' && scan.isQueued) ||
        (this.selectedStatusFilter === 'completed' && scan.isCompleted) ||
        (this.selectedStatusFilter === 'failed' && scan.isFailed) ||
        (this.selectedStatusFilter === 'not_started' && scan.isNotStarted);

      return (
        matchesSearch &&
        matchesPlatform &&
        matchesResilience &&
        matchesStatusTab &&
        matchesStatusHeader
      );
    });

    const direction = this.sortDirection === 'desc' ? -1 : 1;

    return rows.sort((a, b) => {
      const left = a.scannedOn?.getTime() ?? 0;
      const right = b.scannedOn?.getTime() ?? 0;

      return (left - right) * direction;
    });
  }

  get hasActiveScans(): boolean {
    return this.scans.some((scan) => scan.isInProgress);
  }

  get showPagination(): boolean {
    return !this.hasNoScans && this.filteredScans.length > 0 && this.totalCount > 0;
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  /** Push the current view back into the URL; the route then refreshes the model. */
  setRouteQueryParams(params: OffensiveSecurityAttackRunsQueryParams): void {
    this.router.transitionTo({
      queryParams: { ...this.args.queryParams, ...params },
    });
  }

  @action
  handleSearchChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;

    // Filter as the user types; sync the URL only once they pause.
    this.searchQuery = query;

    debounceTask(this, 'setSearchQuery', query, SEARCH_DEBOUNCE_MS);
  }

  setSearchQuery(query: string): void {
    this.setRouteQueryParams({ scan_query: query, scan_offset: 0 });
    this.loadScans.perform(this.limit, 0);
  }

  @action
  handlePlatformFilterChange(value: PlatformFilter): void {
    this.setRouteQueryParams({ scan_platform: value, scan_offset: 0 });
    this.loadScans.perform(this.limit, 0);
  }

  @action
  handleResilienceFilterChange(value: ResilienceFilter): void {
    this.setRouteQueryParams({ scan_resilience: value, scan_offset: 0 });
    this.loadScans.perform(this.limit, 0);
  }

  @action
  handleUploadSuccess(): void {
    this.loadScans.perform();
  }

  @action
  handleSortChange(value: SortDirection): void {
    this.setRouteQueryParams({ scan_sort: value });
  }

  @action
  handleRowClick({ rowValue }: { rowValue: OffsecScanModel }): void {
    this.router.transitionTo(
      'authenticated.dashboard.offensive-security.scan',
      rowValue.id
    );
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }): void {
    this.setRouteQueryParams({ scan_limit: limit, scan_offset: 0 });

    this.loadScans.perform(limit, 0);
  }

  @action
  handlePrevNextAction({
    limit,
    offset,
  }: {
    limit: number;
    offset: number;
  }): void {
    this.setRouteQueryParams({ scan_limit: limit, scan_offset: offset });

    this.loadScans.perform(limit, offset);
  }

  // ─── Data ──────────────────────────────────────────────────────────────────

  /**
   * Limit and offset are passed in rather than read off the getters: the paging
   * handlers fire the fetch alongside a transition, and the new query params are
   * not readable until that transition settles.
   */
  loadScans = task({ drop: true }, async (limit?: number, offset?: number) => {
    try {
      const queryParams: Record<string, unknown> = {
        limit: limit ?? this.limit,
        offset: offset ?? this.offset,
      };

      if (this.searchQuery) {
        queryParams['search'] = this.searchQuery;
      }
      if (this.platformFilter !== 'all') {
        queryParams['platform'] = this.platformFilter;
      }
      if (this.resilienceFilter !== 'all') {
        queryParams['resilience'] = this.resilienceFilter;
      }

      const scans = (await this.store.query(
        'offsec-scan',
        queryParams
      )) as ScanResponseModel;

      this.scans = scans.slice();
      this.totalCount = scans.meta?.count ?? this.scans.length;

      this.managePolling();
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  /**
   * Refresh only while something is actually running. The websocket already pushes
   * status changes; this is the fallback for a dropped connection, so it stops as
   * soon as every run is terminal.
   */
  managePolling(): void {
    if (!this.hasActiveScans) {
      this.stopPolling?.();
      this.stopPolling = undefined;

      return;
    }

    if (this.stopPolling) {
      return;
    }

    this.stopPolling = this.poll.startPolling(
      () => this.loadScans.perform(),
      POLL_INTERVAL_MS
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::AttackRuns': typeof OffensiveSecurityAttackRunsComponent;
    'offensive-security/attack-runs': typeof OffensiveSecurityAttackRunsComponent;
  }
}
