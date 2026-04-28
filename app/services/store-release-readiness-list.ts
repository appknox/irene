import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

import type StoreReleaseReadinessScanModel from 'irene/models/store-release-readiness-scan';
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

type ScanListFilterSnapshot = {
  offset: number;
  query: string;
  platform: number;
  verdict: number;
};

const DEFAULT_SCAN_LIST_FILTERS: ScanListFilterSnapshot = {
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

  @tracked scanQueryResponse: StoreReleaseReadinessScanQueryResponse | null =
    null;

  /**
   * When true, non-default filters/pagination (relative to defaults) are active.
   * Mirrors {@link ProjectService.isProjectReponseFiltered} usage for upload refresh.
   */
  @tracked isScanListResponseFiltered = false;

  private lastLimit: string | number =
    DEFAULT_STORE_RELEASE_READINESS_LIST_QUERY.limit;
  private lastOffset: string | number = DEFAULT_SCAN_LIST_FILTERS.offset;
  private lastQuery: string = DEFAULT_SCAN_LIST_FILTERS.query;
  private lastPlatform: string | number | null | undefined =
    DEFAULT_SCAN_LIST_FILTERS.platform;
  private lastVerdict: string | number | null | undefined =
    DEFAULT_SCAN_LIST_FILTERS.verdict;

  @action
  setScanListResponseFiltered(params: ScanListFilterSnapshot) {
    this.isScanListResponseFiltered = !Object.entries(params).every(
      ([key, value]) => value === DEFAULT_SCAN_LIST_FILTERS[key as keyof ScanListFilterSnapshot]
    );
  }

  /**
   * Re-fetch using the last successful request params (no router transition).
   * Used after upload completes while user is on Store Release Readiness index.
   */
  refreshAfterUpload() {
    this.fetchScans.perform(
      this.lastLimit,
      this.lastOffset,
      this.lastQuery,
      this.lastPlatform,
      this.lastVerdict
    );
  }

  fetchScans = task(
    { drop: true },
    async (
      limit: string | number,
      offset: string | number,
      query: string,
      platform: string | number | undefined | null,
      verdict: string | number | undefined | null
    ) => {
      this.lastLimit = limit;
      this.lastOffset = offset;
      this.lastQuery = query;
      this.lastPlatform = platform;
      this.lastVerdict = verdict;

      const platformForCompare = normalizeFilterParam(platform) ?? -1;
      const verdictForCompare = normalizeFilterParam(verdict) ?? -1;

      this.setScanListResponseFiltered({
        offset: Number(offset),
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

        const platformForApi = normalizeFilterParam(platform);
        if (platformForApi !== undefined) {
          queryPayload['platform'] = platformForApi;
        }

        const verdictForApi = normalizeFilterParam(verdict);
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
}
