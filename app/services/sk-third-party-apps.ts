import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type Store from 'ember-data/store';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import parseError from 'irene/utils/parse-error';
import ENUMS from 'irene/enums';
import type SkThirdPartyAppModel from 'irene/models/sk-third-party-app';

const RISK_STATUS_LABELS: Record<number, string> = {
  [ENUMS.SK_THIRD_PARTY_APP_RISK_STATUS.MINIMAL]: 'minimal',
  [ENUMS.SK_THIRD_PARTY_APP_RISK_STATUS.MEDIUM]: 'medium',
  [ENUMS.SK_THIRD_PARTY_APP_RISK_STATUS.HIGH]: 'high',
};

export type SkThirdPartyAppStoreFilter = 'appstore' | 'playstore';

type SkThirdPartyAppArray =
  DS.AdapterPopulatedRecordArray<SkThirdPartyAppModel> & {
    meta: { count: number };
  };

export interface SkThirdPartyAppsQueryParams {
  limit?: number;
  offset?: number;
  storeFilter?: SkThirdPartyAppStoreFilter;
  region?: string;
  filterQuery?: string;
  riskStatusFilter?: number;
}

export default class SkThirdPartyAppsService extends Service {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked apps?: DS.AdapterPopulatedRecordArray<SkThirdPartyAppModel>;
  @tracked totalCount = 0;
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked storeFilter: SkThirdPartyAppStoreFilter = 'appstore';
  @tracked region = 'US';
  @tracked filterQuery = '';
  @tracked riskStatusFilter = -1;

  get isFetching() {
    return this.fetch.isRunning;
  }

  @action
  setQueryParams({
    limit = this.limit,
    offset = this.offset,
    storeFilter = this.storeFilter,
    region = this.region,
    filterQuery = this.filterQuery,
    riskStatusFilter = this.riskStatusFilter,
  }: SkThirdPartyAppsQueryParams) {
    this.limit = limit;
    this.offset = offset;
    this.storeFilter = storeFilter;
    this.region = region;
    this.filterQuery = filterQuery;
    this.riskStatusFilter = riskStatusFilter;

    return this;
  }

  async reload() {
    await this.fetch.perform();
  }

  fetch = task({ keepLatest: true }, async () => {
    try {
      const queryParams: Record<string, unknown> = {
        store: this.storeFilter,
        region: this.region,
        limit: this.limit,
        offset: this.offset,
      };

      if (this.filterQuery) {
        queryParams['filter'] = this.filterQuery;
      }

      const riskStatusLabel = RISK_STATUS_LABELS[this.riskStatusFilter];

      if (riskStatusLabel) {
        queryParams['risk_status'] = riskStatusLabel;
      }

      const result = (await this.store.query(
        'sk-third-party-app',
        queryParams
      )) as SkThirdPartyAppArray;

      this.apps = result;
      this.totalCount = result.meta.count;
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@ember/service' {
  interface Registry {
    'sk-third-party-apps': SkThirdPartyAppsService;
  }
}
