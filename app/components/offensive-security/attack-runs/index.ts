import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { debounceTask } from 'ember-lifeline';
import { addObserver, removeObserver } from '@ember/object/observers';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type { EmberTableSort } from 'ember-table';

import parseError from 'irene/utils/parse-error';
import type OffsecScanModel from 'irene/models/offsec-scan';
import type PollService from 'irene/services/poll';
import type EventBusService from 'irene/services/event-bus';
import type RealtimeService from 'irene/services/realtime';

export type PlatformFilter = 'all' | 'android' | 'ios';

export type ResilienceFilter =
  | 'all'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'weak'
  | 'moderate'
  | 'strong'
  | 'very-strong'
  | 'very_strong';

export type StatusFilter =
  | 'all'
  | 'running'
  | 'queued'
  | 'completed'
  | 'failed'
  | 'not_started';

export type SortDirection = 'asc' | 'desc';

export interface OffsecStatusCounts {
  completed?: number;
  in_processing?: number;
  failed?: number;
  in_progress?: number;
  running?: number;
}

type ScanResponseModel = DS.AdapterPopulatedRecordArray<OffsecScanModel> & {
  meta?: {
    count?: number;
    status_counts?: OffsecStatusCounts;
  };
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
  @service declare eventBus: EventBusService;
  @service declare realtime: RealtimeService;

  @tracked scans: OffsecScanModel[] = [];
  @tracked totalCount = 0;
  @tracked validatingSubmissionsCount = 0;
  @tracked isRecentlyUploaded = false;
  @tracked totalAllScansCount: number | null = null;
  @tracked totalRunningScansCount: number | null = null;
  @tracked totalCompletedScansCount: number | null = null;
  @tracked totalFailedScansCount: number | null = null;
  @tracked selectedResilienceFilter: ResilienceFilter | null = null;
  @tracked selectedPlatformFilter: PlatformFilter | null = null;

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

    this.eventBus.on('ws:offsec-scan:update', this, this.handleRealtimeUpdate);
    // eslint-disable-next-line ember/no-observers
    addObserver(
      this.realtime,
      'SubmissionCounter',
      this,
      this.handleRealtimeUpdate
    );

    this.loadScans.perform();
  }

  willDestroy(): void {
    super.willDestroy();

    this.eventBus.off('ws:offsec-scan:update', this, this.handleRealtimeUpdate);
    removeObserver(
      this.realtime,
      'SubmissionCounter',
      this,
      this.handleRealtimeUpdate
    );
    this.stopPolling?.();
  }

  @action
  handleRealtimeUpdate(): void {
    this.isRecentlyUploaded = true;
    this.loadScans.perform();
    debounceTask(this, 'clearRecentlyUploaded', 30000);
  }

  clearRecentlyUploaded(): void {
    this.isRecentlyUploaded = false;
    this.managePolling();
  }

  // ─── Query-param backed state ──────────────────────────────────────────────
  // Filters, search, sort and paging all live in the URL so a filtered view is
  // shareable and survives a reload or a back navigation.

  get limit() {
    return Number(this.args.queryParams?.scan_limit ?? DEFAULT_LIMIT);
  }

  get offset() {
    return Number(this.args.queryParams?.scan_offset ?? 0);
  }

  get platformFilter(): PlatformFilter {
    return (
      this.selectedPlatformFilter ??
      this.args.queryParams?.scan_platform ??
      'all'
    );
  }

  get resilienceFilter(): ResilienceFilter {
    return (
      this.selectedResilienceFilter ??
      this.args.queryParams?.scan_resilience ??
      'all'
    );
  }

  get sortDirection(): SortDirection {
    return this.args.queryParams?.scan_sort ?? 'desc';
  }

  // ─── Derived view state ────────────────────────────────────────────────────

  get isLoading() {
    return this.loadScans.isRunning && this.scans.length === 0;
  }

  get hasFiltersApplied() {
    return (
      Boolean(this.searchQuery?.trim()) ||
      this.platformFilter !== 'all' ||
      this.resilienceFilter !== 'all' ||
      this.selectedStatusTab !== 'all' ||
      this.selectedStatusFilter !== 'all'
    );
  }

  get hasNoScans() {
    return (
      !this.isLoading && this.scans.length === 0 && !this.hasFiltersApplied
    );
  }

  get columns() {
    return [
      {
        name: this.intl.t('targetID'),
        valuePath: 'id',
        textAlign: 'center',
        width: 100,
        isSortable: false,
      },
      {
        name: this.intl.t('platform'),
        component: 'offensive-security/attack-runs/table/platform',
        headerComponent: 'offensive-security/attack-runs/table/platform-header',
        textAlign: 'center',
        width: 90,
        isSortable: false,
      },
      {
        name: this.intl.t('offensiveSecurity.application'),
        component: 'offensive-security/attack-runs/table/target',
        minWidth: 160,
        isSortable: false,
      },
      {
        name: this.intl.t('offensiveSecurity.package'),
        valuePath: 'packageName',
        minWidth: 180,
        isSortable: false,
      },
      {
        name: this.intl.t('version'),
        valuePath: 'versionLabel',
        width: 110,
        isSortable: false,
      },
      {
        name: this.intl.t('offensiveSecurity.risk'),
        component: 'offensive-security/attack-runs/table/resilience',
        headerComponent:
          'offensive-security/attack-runs/table/resilience-header',
        textAlign: 'center',
        width: 140,
        isSortable: false,
      },
      {
        name: this.intl.t('offensiveSecurity.defensesBypassed'),
        valuePath: 'protectionsBypassedLabel',
        textAlign: 'center',
        width: 100,
        isSortable: false,
      },
      {
        name: this.intl.t('offensiveSecurity.runOn'),
        valuePath: 'scannedOnLabel',
        width: 130,
      },
      {
        name: this.intl.t('status'),
        component: 'offensive-security/attack-runs/table/status',
        headerComponent: 'offensive-security/attack-runs/table/status-header',
        width: 150,
        isSortable: false,
      },
    ];
  }

  get sorts(): EmberTableSort[] {
    return [
      {
        valuePath: 'scannedOnLabel',
        isAscending: this.sortDirection === 'asc',
      },
    ];
  }

  @action
  isSortableColumn(valuePath?: string) {
    return valuePath === 'scannedOnLabel';
  }

  @action
  isColumnSortedAsc(valuePath?: string) {
    if (valuePath === 'scannedOnLabel') {
      return this.sortDirection === 'asc';
    }

    return false;
  }

  @action
  updateSorts(incomingSorts: EmberTableSort[]): void {
    if (incomingSorts.length) {
      const clicked = incomingSorts[incomingSorts.length - 1];
      if (clicked?.valuePath === 'scannedOnLabel') {
        const nextDirection: SortDirection = clicked.isAscending
          ? 'asc'
          : 'desc';
        this.setRouteQueryParams({ scan_sort: nextDirection });

        return;
      }
    }

    const nextDirection: SortDirection =
      this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.setRouteQueryParams({ scan_sort: nextDirection });
  }

  @tracked selectedStatusFilter: StatusFilter = 'all';

  @action
  handleStatusFilterChange(value: StatusFilter): void {
    this.selectedStatusFilter = value;
  }

  @tracked selectedStatusTab: 'all' | 'running' | 'completed' | 'failed' =
    'all';

  get totalRunsDisplay() {
    if (this.totalAllScansCount !== null) {
      return this.totalAllScansCount;
    }

    return this.totalCount ?? this.scans.length;
  }

  get runningCount() {
    if (this.totalRunningScansCount !== null) {
      return this.totalRunningScansCount;
    }

    return this.scans.filter((s) => s.isInProgress || s.isRunning).length;
  }

  get hasRunningScans() {
    return this.runningCount > 0;
  }

  get completedCount() {
    if (this.totalCompletedScansCount !== null) {
      return this.totalCompletedScansCount;
    }

    return this.scans.filter((s) => s.isCompleted).length;
  }

  get failedCount() {
    if (this.totalFailedScansCount !== null) {
      return this.totalFailedScansCount;
    }

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
        Boolean(scan.packageName?.toLowerCase().includes(query)) ||
        Boolean(scan.id?.toString().toLowerCase().includes(query)) ||
        Boolean(scan.targetFileId?.toString().toLowerCase().includes(query));

      const matchesPlatform =
        this.platformFilter === 'all' || scan.platform === this.platformFilter;

      // Risk / resilience filter
      let matchesResilience = true;
      if (this.resilienceFilter !== 'all') {
        const filterUpper = this.resilienceFilter.toUpperCase();
        const riskRatingMap: Record<string, string> = {
          CRITICAL: 'CRITICAL',
          HIGH: 'HIGH',
          MEDIUM: 'MEDIUM',
          LOW: 'LOW',
          WEAK: 'CRITICAL',
          MODERATE: 'HIGH',
          STRONG: 'MEDIUM',
          'VERY-STRONG': 'LOW',
          VERY_STRONG: 'LOW',
        };
        const targetRisk = riskRatingMap[filterUpper] ?? filterUpper;
        matchesResilience =
          scan.effectiveRiskRating === targetRisk ||
          scan.riskClass === this.resilienceFilter.toLowerCase() ||
          (scan.hasResilience &&
            scan.resilienceClass === this.resilienceFilter);
      }

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

  get hasActiveScans() {
    const activeScans = this.scans.some((scan) => scan.isInProgress);

    return (
      activeScans ||
      this.validatingSubmissionsCount > 0 ||
      this.isRecentlyUploaded
    );
  }

  get showPagination() {
    return (
      !this.hasNoScans && this.filteredScans.length > 0 && this.totalCount > 0
    );
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
    this.loadScans.perform(this.limit, 0, { search: query });
  }

  @action
  handlePlatformFilterChange(value: PlatformFilter): void {
    this.selectedPlatformFilter = value;
    this.setRouteQueryParams({ scan_platform: value, scan_offset: 0 });
    this.loadScans.perform(this.limit, 0, { platform: value });
  }

  @action
  handleResilienceFilterChange(value: ResilienceFilter): void {
    this.selectedResilienceFilter = value;
    this.setRouteQueryParams({ scan_resilience: value, scan_offset: 0 });
    this.loadScans.perform(this.limit, 0, { resilience: value });
  }

  @action
  handleUploadSuccess(): void {
    this.handleRealtimeUpdate();
  }

  @action
  handleSortChange(value: SortDirection): void {
    this.setRouteQueryParams({ scan_sort: value });
  }

  @action
  handleRowClick({ rowValue }: { rowValue: OffsecScanModel }): void {
    this.router.transitionTo(
      'authenticated.offensive-security.scan',
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
  loadScans = task(
    { restartable: true },
    async (
      limit?: number,
      offset?: number,
      options?: {
        resilience?: ResilienceFilter;
        platform?: PlatformFilter;
        search?: string;
      }
    ) => {
      try {
        const currentLimit = limit ?? this.limit;
        const currentOffset = offset ?? this.offset;
        const currentSearch = options?.search ?? this.searchQuery;
        const currentPlatform = options?.platform ?? this.platformFilter;
        const currentResilience = options?.resilience ?? this.resilienceFilter;

        const queryParams: Record<string, unknown> = {
          limit: currentLimit,
          offset: currentOffset,
        };

        if (currentSearch) {
          queryParams['search'] = currentSearch;
        }
        if (currentPlatform !== 'all') {
          queryParams['platform'] = currentPlatform;
        }
        if (currentResilience !== 'all') {
          const filterUpper = currentResilience.toUpperCase();
          const riskRatingMap: Record<string, string> = {
            CRITICAL: 'CRITICAL',
            HIGH: 'HIGH',
            MEDIUM: 'MEDIUM',
            LOW: 'LOW',
            WEAK: 'CRITICAL',
            MODERATE: 'HIGH',
            STRONG: 'MEDIUM',
            'VERY-STRONG': 'LOW',
            VERY_STRONG: 'LOW',
          };
          const mappedRiskRating = riskRatingMap[filterUpper] ?? filterUpper;
          queryParams['risk_rating'] = mappedRiskRating;
        }

        const [scans, submissions] = await Promise.all([
          this.store.query(
            'offsec-scan',
            queryParams
          ) as Promise<ScanResponseModel>,
          this.store
            .query('submission', { offsec: true, status: 4 })
            .catch(() => null),
        ]);

        const recordList = scans.slice();

        this.scans = recordList;
        this.totalCount = scans.meta?.count ?? this.scans.length;
        const subLen = submissions?.length;
        this.validatingSubmissionsCount =
          typeof subLen === 'number' ? subLen : 0;

        const hasActiveFilters =
          Boolean(currentSearch?.trim()) ||
          currentPlatform !== 'all' ||
          currentResilience !== 'all' ||
          this.selectedStatusTab !== 'all' ||
          this.selectedStatusFilter !== 'all';

        const statusCounts = scans.meta?.status_counts;
        const total = scans.meta?.count ?? recordList.length;

        if (statusCounts) {
          this.updateCountsFromStatusCounts(statusCounts, total);
        } else if (!hasActiveFilters) {
          this.updateCountsFromRecordList(recordList, total);
        } else if (this.totalAllScansCount === null) {
          this.loadOverallStats.perform();
        }

        this.managePolling();
      } catch (error) {
        this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
      }
    }
  );

  private updateCountsFromStatusCounts(
    statusCounts: OffsecStatusCounts,
    totalCount: number
  ): void {
    this.totalAllScansCount = totalCount;
    this.totalCompletedScansCount = statusCounts.completed ?? 0;
    this.totalRunningScansCount =
      statusCounts.in_processing ??
      statusCounts.in_progress ??
      statusCounts.running ??
      0;
    this.totalFailedScansCount = statusCounts.failed ?? 0;
  }

  private updateCountsFromRecordList(
    recordList: OffsecScanModel[],
    totalCount: number
  ): void {
    this.totalAllScansCount = totalCount;
    this.totalRunningScansCount = recordList.filter(
      (s) => s.isInProgress || s.isRunning
    ).length;
    this.totalCompletedScansCount = recordList.filter(
      (s) => s.isCompleted
    ).length;
    this.totalFailedScansCount = recordList.filter((s) => s.isFailed).length;
  }

  loadOverallStats = task(async () => {
    try {
      const overallScans = (await this.store.query('offsec-scan', {
        limit: 100,
        offset: 0,
      })) as ScanResponseModel;
      const list = overallScans.slice();
      const statusCounts = overallScans.meta?.status_counts;
      const total = overallScans.meta?.count ?? list.length;

      if (statusCounts) {
        this.updateCountsFromStatusCounts(statusCounts, total);
      } else {
        this.updateCountsFromRecordList(list, total);
      }
    } catch {
      // Non-critical, ignore
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
