import Service, { service } from '@ember/service';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import parseError from 'irene/utils/parse-error';
import type StoreReleaseReadinessScanModel from 'irene/models/store-release-readiness-scan';

type StoreReleaseReadinessScanQueryResponse =
  DS.AdapterPopulatedRecordArray<StoreReleaseReadinessScanModel> & {
    meta: { count: number };
  };

type ScanListFilterSnapshot = {
  query: string;
  platform: number;
  verdict: number;
};

type ScanListPaginationParam = string | number;

type ScanListFilterParam = string | number | null | undefined;

const DEFAULT_SCAN_LIST_FILTERS = {
  offset: 0,
  query: '',
  platform: -1,
  verdict: -1,
};

export const DEFAULT_STORE_RELEASE_READINESS_LIST_QUERY = {
  limit: 12,
  ...DEFAULT_SCAN_LIST_FILTERS,
} as const;

export default class StoreReleaseReadinessListService extends Service {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;
  @service declare router: RouterService;

  @tracked scanQueryResponse: StoreReleaseReadinessScanQueryResponse | null =
    null;

  @tracked isScanListResponseFiltered = false;

  private lastLimit: ScanListPaginationParam =
    DEFAULT_STORE_RELEASE_READINESS_LIST_QUERY.limit;
  private lastOffset: ScanListPaginationParam =
    DEFAULT_SCAN_LIST_FILTERS.offset;
  private lastQuery: string = DEFAULT_SCAN_LIST_FILTERS.query;
  private lastPlatform: ScanListFilterParam =
    DEFAULT_SCAN_LIST_FILTERS.platform;
  private lastVerdict: ScanListFilterParam = DEFAULT_SCAN_LIST_FILTERS.verdict;

  @action
  setScanListResponseFiltered(params: ScanListFilterSnapshot) {
    this.isScanListResponseFiltered = !Object.entries(params).every(
      ([key, value]) =>
        value === DEFAULT_SCAN_LIST_FILTERS[key as keyof ScanListFilterSnapshot]
    );
  }

  refreshAfterUpload() {
    this.fetchStoreReleaseReadinessScans.perform(
      this.lastLimit,
      this.lastOffset,
      this.lastQuery,
      this.lastPlatform,
      this.lastVerdict
    );
  }

  normalizeFilterParam(value: ScanListFilterParam): number | undefined {
    if (isEmpty(value)) {
      return undefined;
    }

    const n = Number(value);

    return Number.isNaN(n) || n === -1 ? undefined : n;
  }

  fetchStoreReleaseReadinessScans = task(
    { drop: true },
    async (
      limit: ScanListPaginationParam,
      offset: ScanListPaginationParam,
      query: string,
      platform: ScanListFilterParam,
      verdict: ScanListFilterParam,
      setQueryParams = true
    ) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset, query, platform, verdict);
      }

      this.lastLimit = limit;
      this.lastOffset = offset;
      this.lastQuery = query;
      this.lastPlatform = platform;
      this.lastVerdict = verdict;

      const platformForCompare = this.normalizeFilterParam(platform) ?? -1;
      const verdictForCompare = this.normalizeFilterParam(verdict) ?? -1;

      this.setScanListResponseFiltered({
        query,
        platform: platformForCompare,
        verdict: verdictForCompare,
      });

      try {
        const queryPayload: Record<string, string | number> = {
          limit,
          offset,
        };

        if (query) {
          queryPayload['search'] = query;
        }

        const platformForApi = this.normalizeFilterParam(platform);

        if (platformForApi !== undefined) {
          queryPayload['platform'] = platformForApi;
        }

        const verdictForApi = this.normalizeFilterParam(verdict);

        if (verdictForApi !== undefined) {
          queryPayload['verdict'] = verdictForApi;
        }

        this.scanQueryResponse = (await this.store.query(
          'store-release-readiness-scan',
          queryPayload
        )) as StoreReleaseReadinessScanQueryResponse;
      } catch (e) {
        this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
      }
    }
  );

  setRouteQueryParams(
    limit: ScanListPaginationParam,
    offset: ScanListPaginationParam,
    query: string,
    platform: ScanListFilterParam,
    verdict: ScanListFilterParam
  ) {
    const searchQueryParam = query || null;
    const platformNum = this.normalizeFilterParam(platform);
    const verdictNum = this.normalizeFilterParam(verdict);
    const platformQuery = platformNum?.toString() ?? null;
    const verdictQuery = verdictNum?.toString() ?? null;

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
}
