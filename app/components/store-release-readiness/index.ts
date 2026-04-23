import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type Store from '@ember-data/store';
import { task } from 'ember-concurrency';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';
import { debounceTask } from 'ember-lifeline';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import type { StoreReleaseReadinessIndexQueryParam } from 'irene/routes/authenticated/dashboard/store-release-readiness/index';
import type StoreReleaseReadinessScanModel from 'irene/models/store-release-readiness-scan';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type {
  PlatformObject,
  RejectionRiskObject,
} from 'irene/components/store-release-readiness/header';
import parseError from 'irene/utils/parse-error';

type StoreReleaseReadinessScanQueryResponse =
  DS.AdapterPopulatedRecordArray<StoreReleaseReadinessScanModel> & {
    meta: { count: number };
  };

/** URL / task values → API number. `null`/`undefined`/`''` must not become `0` (Number(null) === 0). */
function normalizeFilterParam(
  value: string | number | undefined | null
): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const n = Number(value);
  if (Number.isNaN(n) || n === -1) {
    return undefined;
  }
  return n;
}

export interface StoreReleaseReadinessSignature {
  Args: {
    queryParams: StoreReleaseReadinessIndexQueryParam;
  };
}

export default class StoreReleaseReadinessComponent extends Component<StoreReleaseReadinessSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked
  storeReleaseReadinessScanQueryResponse: StoreReleaseReadinessScanQueryResponse | null =
    null;

  tPleaseTryAgain: string;

  constructor(owner: unknown, args: StoreReleaseReadinessSignature['Args']) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    const {
      app_limit,
      app_offset,
      app_query,
      app_platform,
      app_rejection_risk,
    } = args.queryParams;

    this.fetchStoreReleaseReadinessScans.perform(
      app_limit,
      app_offset,
      app_query,
      app_platform,
      app_rejection_risk,
      false
    );
  }

  get limit() {
    return Number(this.args.queryParams.app_limit);
  }

  get offset() {
    return Number(this.args.queryParams.app_offset);
  }

  get isLoading() {
    return this.fetchStoreReleaseReadinessScans.isRunning;
  }

  get hasActiveSearchOrFilters() {
    const { app_query, app_platform, app_rejection_risk } =
      this.args.queryParams;

    const query = (app_query ?? '').trim();

    if (query !== '') {
      return true;
    }

    if (normalizeFilterParam(app_platform) !== undefined) {
      return true;
    }

    if (normalizeFilterParam(app_rejection_risk) !== undefined) {
      return true;
    }

    return false;
  }

  get hasNoStoreReleaseReadinessScan() {
    return (
      this.totalStoreReleaseReadinessScanCount === 0 &&
      !this.isLoading &&
      this.hasActiveSearchOrFilters
    );
  }

  get showPagination() {
    return this.totalStoreReleaseReadinessScanCount > 0;
  }

  get totalStoreReleaseReadinessScanCount() {
    return this.storeReleaseReadinessScanQueryResponse?.meta?.count || 0;
  }

  get storeReleaseReadinessScanList() {
    return this.storeReleaseReadinessScanQueryResponse?.slice() || [];
  }

  get resultDependencies() {
    const { app_query, app_platform, app_rejection_risk } =
      this.args.queryParams;

    return [
      this.limit,
      this.offset,
      app_query,
      app_platform,
      app_rejection_risk,
    ];
  }

  @action handleResultDependenciesChange() {
    const { app_query, app_platform, app_rejection_risk } =
      this.args.queryParams;

    this.fetchStoreReleaseReadinessScans.perform(
      this.limit,
      this.offset,
      app_query,
      app_platform,
      app_rejection_risk,
      false
    );
  }

  @action handlePrevNextAction({
    limit,
    offset,
  }: PaginationProviderActionsArgs) {
    const { app_query, app_platform, app_rejection_risk } =
      this.args.queryParams;

    this.fetchStoreReleaseReadinessScans.perform(
      limit,
      offset,
      app_query,
      app_platform,
      app_rejection_risk
    );
  }

  @action handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    const { app_query, app_platform, app_rejection_risk } =
      this.args.queryParams;

    this.fetchStoreReleaseReadinessScans.perform(
      limit,
      0,
      app_query,
      app_platform,
      app_rejection_risk
    );
  }

  @action searchStoreReleaseReadinessForQuery(event: Event) {
    const query = (event.target as HTMLInputElement).value;

    debounceTask(this, 'setSearchQuery', query, 500);
  }

  setSearchQuery(query: string) {
    const { app_platform, app_rejection_risk } = this.args.queryParams;

    this.fetchStoreReleaseReadinessScans.perform(
      this.limit,
      0,
      query,
      app_platform,
      app_rejection_risk
    );
  }

  @action handleSearchClear() {
    const { app_platform, app_rejection_risk } = this.args.queryParams;

    this.fetchStoreReleaseReadinessScans.perform(
      this.limit,
      0,
      '',
      app_platform,
      app_rejection_risk
    );
  }

  @action filterPlatform(platform: PlatformObject) {
    const { app_limit, app_query, app_rejection_risk } = this.args.queryParams;

    this.fetchStoreReleaseReadinessScans.perform(
      app_limit,
      0,
      app_query,
      platform.value.toString(),
      app_rejection_risk
    );
  }

  @action filterRejectionRisk(risk: RejectionRiskObject) {
    const { app_limit, app_query, app_platform } = this.args.queryParams;

    this.fetchStoreReleaseReadinessScans.perform(
      app_limit,
      0,
      app_query,
      app_platform,
      risk.value.toString()
    );
  }

  @action handleClearFilters() {
    const { app_limit, app_query } = this.args.queryParams;

    this.fetchStoreReleaseReadinessScans.perform(
      app_limit,
      0,
      app_query,
      '-1',
      '-1'
    );
  }

  setRouteQueryParams(
    limit: string | number,
    offset: string | number,
    query: string,
    platform: string | number | undefined | null,
    verdict: string | number | undefined | null
  ) {
    const searchQueryParam = query || null;
    const platformNum = normalizeFilterParam(platform);
    const verdictNum = normalizeFilterParam(verdict);
    const platformQuery =
      platformNum !== undefined ? String(platformNum) : null;
    const verdictQuery = verdictNum !== undefined ? String(verdictNum) : null;

    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
        app_query: searchQueryParam,
        app_platform: platformQuery,
        app_rejection_risk: verdictQuery,
      },
    });
  }

  fetchStoreReleaseReadinessScans = task(
    { drop: true },
    async (
      limit: string | number,
      offset: string | number,
      query: string,
      platform: string | number | undefined | null,
      verdict: string | number | undefined | null,
      setQueryParams = true
    ) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset, query, platform, verdict);
      }

      try {
        const queryPayload: Record<string, string | number> = {
          limit,
          offset,
        };

        if (query) {
          queryPayload['search'] = query;
        }

        const platformForApi = normalizeFilterParam(platform);
        if (platformForApi !== undefined) {
          queryPayload['platform'] = platformForApi;
        }

        const verdictForApi = normalizeFilterParam(verdict);
        if (verdictForApi !== undefined) {
          queryPayload['verdict'] = verdictForApi;
        }

        this.storeReleaseReadinessScanQueryResponse = (await this.store.query(
          'store-release-readiness-scan',
          queryPayload
        )) as StoreReleaseReadinessScanQueryResponse;
      } catch (e) {
        this.notify.error(parseError(e, this.tPleaseTryAgain));
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    StoreReleaseReadiness: typeof StoreReleaseReadinessComponent;
  }
}
