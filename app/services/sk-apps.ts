import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type Store from 'ember-data/store';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import type SkAppModel from 'irene/models/sk-app';

type SkAppModelArray = DS.AdapterPopulatedRecordArray<SkAppModel> & {
  meta: { count: number };
};

export default class SkAppsService extends Service {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked
  skApps?: DS.AdapterPopulatedRecordArray<SkAppModel>;

  @tracked limit = 10;
  @tracked offset = 0;
  @tracked monitoringStatusFilter = -1;
  @tracked skAppsCount = 0;

  get isFetchingSkInventoryApps() {
    return this.fetch.isRunning;
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
