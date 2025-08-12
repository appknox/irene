import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import type SkAppModel from 'irene/models/sk-app';

type SkArchivedAppModelArray = DS.AdapterPopulatedRecordArray<SkAppModel> & {
  meta: { count: number };
};

export default class SkArchivedAppsService extends Service {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked
  skArchivedApps?: DS.AdapterPopulatedRecordArray<SkAppModel>;

  @tracked limit = 10;
  @tracked offset = 0;
  @tracked skArchivedAppsCount = 0;

  get isFetchingSkArchivedApps() {
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
      app_status: ENUMS.SK_APP_STATUS.ARCHIVED,
    };

    try {
      const skArchivedApps = (await this.store.query(
        'sk-app',
        queryParams
      )) as SkArchivedAppModelArray;

      this.skArchivedApps = skArchivedApps;
      this.skArchivedAppsCount = skArchivedApps.meta.count;
    } catch (error) {
      this.notify.error(
        'Failed to load Archived Apps Data. Check your network and try again.',
        ENV.notifications
      );
    }
  });
}
