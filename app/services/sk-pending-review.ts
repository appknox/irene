import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type RouterService from '@ember/routing/router-service';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import parseError from 'irene/utils/parse-error';
import ENUMS from 'irene/enums';
import type SkAppModel from 'irene/models/sk-app';

type SkPendingReviewResponse = DS.AdapterPopulatedRecordArray<SkAppModel> & {
  meta: { count: number };
};

export default class SkPendingReviewService extends Service {
  @tracked skPendingReviewData: SkPendingReviewResponse | null = null;
  @tracked singleUpdate = false;

  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked limit = 10;
  @tracked offset = 0;
  @tracked skPendingReviewAppsCount = 0;

  get isFetchingSkPendingReviewApps() {
    return this.fetchPendingReviewApps.isRunning;
  }

  setLimitOffset({ limit = 10, offset = 0 }) {
    this.limit = limit;
    this.offset = offset;

    return this;
  }

  async reload() {
    await this.fetchPendingReviewApps.perform();
  }

  fetchPendingReviewApps = task({ keepLatest: true }, async () => {
    try {
      const skPendingReviewData = (await this.store.query('sk-app', {
        limit: this.limit,
        offset: this.offset,
        approval_status: ENUMS.SK_APPROVAL_STATUS.PENDING_APPROVAL,
        app_status: ENUMS.SK_APP_STATUS.ACTIVE,
      })) as SkPendingReviewResponse;

      this.skPendingReviewData = skPendingReviewData;
      this.skPendingReviewAppsCount = skPendingReviewData.meta.count;

      this.singleUpdate = false;
    } catch (e) {
      this.notify.error(parseError(e));
    }
  });
}
