import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type Store from 'ember-data/store';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type SkAppModel from 'irene/models/sk-app';
import type SkFakeAppInventoryModel from 'irene/models/sk-fake-app-inventory';

type SkAppModelArray = DS.AdapterPopulatedRecordArray<SkAppModel> & {
  meta: { count: number };
};

type SkFakeAppInventoryModelArray =
  DS.AdapterPopulatedRecordArray<SkFakeAppInventoryModel> & {
    meta: { count: number };
  };

export default class SkAppsService extends Service {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked
  skApps?: DS.AdapterPopulatedRecordArray<SkAppModel>;

  @tracked
  skFakeApps?: DS.AdapterPopulatedRecordArray<SkFakeAppInventoryModel>;

  @tracked limit = 10;
  @tracked offset = 0;
  @tracked monitoringStatusFilter = -1;
  @tracked skAppsCount = 0;
  @tracked skFakeAppsCount = 0;
  @tracked searchQuery = '';

  get isFetchingSkInventoryApps() {
    return this.fetch.isRunning;
  }

  get isFetchingSkFakeApps() {
    return this.fetchFakeApps.isRunning;
  }

  @action
  setQueryParams({
    limit = this.limit,
    offset = this.offset,
    monitoringStatusFilter = this.monitoringStatusFilter,
  }) {
    this.limit = limit;
    this.offset = offset;
    this.monitoringStatusFilter = monitoringStatusFilter;

    return this;
  }

  async reload() {
    await this.fetch.perform();
  }

  fetchFakeApps = task({ keepLatest: true }, async () => {
    const queryParams = {
      limit: this.limit,
      offset: this.offset,

      ...(this.monitoringStatusFilter !== -1 && {
        monitoring_status: this.monitoringStatusFilter,
      }),

      ...(this.searchQuery && { q: this.searchQuery }),
    };

    try {
      const skApps = (await this.store.query(
        'sk-fake-app-inventory',
        queryParams
      )) as SkFakeAppInventoryModelArray;

      this.skFakeApps = skApps;
      this.skFakeAppsCount = skApps.meta.count;
    } catch (error) {
      const err = parseError(error);
      this.notify.error(err);
    }
  });

  fetch = task({ keepLatest: true }, async () => {
    const queryParams = {
      limit: this.limit,
      offset: this.offset,
      approval_status: ENUMS.SK_APPROVAL_STATUS.APPROVED,
      app_status: ENUMS.SK_APP_STATUS.ACTIVE,

      ...(this.monitoringStatusFilter !== -1 && {
        monitoring_status: this.monitoringStatusFilter,
      }),
    };

    try {
      const skApps = (await this.store.query(
        'sk-app',
        queryParams
      )) as SkAppModelArray;

      this.skApps = skApps;
      this.skAppsCount = skApps.meta.count;
    } catch (error) {
      this.notify.error(
        'Failed to load Inventory Apps Data. Check your network and try again.',
        ENV.notifications
      );
    }
  });
}
