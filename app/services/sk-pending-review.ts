import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';

import parseError from 'irene/utils/parse-error';
import type SkAppModel from 'irene/models/sk-app';
import ENUMS from 'irene/enums';

type SkPendingReviewResponse = DS.AdapterPopulatedRecordArray<SkAppModel> & {
  meta: { count: number };
};

export default class ServiceAccountService extends Service {
  @tracked skPendingReviewData: SkPendingReviewResponse | null = null;
  @tracked singleUpdate: boolean = false;

  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  fetchPendingReviewApps = task(
    { drop: true },
    async (
      limit: number = 10,
      offset: number = 0,
      setQueryParams: boolean = true
    ) => {
      try {
        if (setQueryParams) {
          this.setRouteQueryParams(limit, offset);
        }

        this.skPendingReviewData = (await this.store.query('skApp', {
          limit,
          offset,
          approval_status: ENUMS.SK_APPROVAL_STATUS.PENDING_APPROVAL,
          app_status: ENUMS.SK_APP_STATUS.ACTIVE,
        })) as SkPendingReviewResponse;

        this.singleUpdate = false;
      } catch (e) {
        this.notify.error(parseError(e));
      }
    }
  );

  get totalCount() {
    return this.skPendingReviewData?.meta?.count || 0;
  }

  setRouteQueryParams(limit: number, offset: number) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
      },
    });
  }
}
