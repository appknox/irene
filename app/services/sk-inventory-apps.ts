// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';

import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';

import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import type SkInventoryAppModel from 'irene/models/sk-app';

type SkInventoryAppModelArray =
  DS.AdapterPopulatedRecordArray<SkInventoryAppModel> & {
    meta: { count: number };
  };

export default class SkInventoryAppService extends Service {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked
  skInventoryApps?: DS.AdapterPopulatedRecordArray<SkInventoryAppModel>;

  @tracked limit = 10;
  @tracked offset = 0;
  @tracked skInventoryAppsCount = 0;

  get isFetchingSkInventoryApps() {
    return this.fetch.isRunning;
  }

  setLimitOffset({ limit = 10, offset = 0 }) {
    this.limit = limit;
    this.offset = offset;

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
    };

    try {
      const skInventoryApps = (await this.store.query(
        'sk-app',
        queryParams
      )) as SkInventoryAppModelArray;

      this.skInventoryApps = skInventoryApps;
      this.skInventoryAppsCount = skInventoryApps.meta.count;
    } catch (error) {
      debugger;

      this.notify.error(
        'Failed to load Inventory Apps Data. Check your network and try again.',
        ENV.notifications
      );
    }
  });
}
