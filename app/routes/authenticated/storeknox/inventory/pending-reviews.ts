import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type MeService from 'irene/services/me';
import type SkPendingReviewService from 'irene/services/sk-pending-review';
import type SkAppsService from 'irene/services/sk-apps';

export interface StoreknoxInventoryPendingReviewsQueryParam {
  app_limit: number;
  app_offset: number;
}

export default class AuthenticatedStoreknoxInventoryPendingReviewsRoute extends AkBreadcrumbsRoute {
  @service declare me: MeService;
  @service declare router: RouterService;
  @service declare skPendingReview: SkPendingReviewService;
  @service('sk-apps') declare skAppsService: SkAppsService;

  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
  };

  async beforeModel() {
    if (!this.me.org?.is_owner) {
      this.router.transitionTo('authenticated.storeknox.inventory.app-list');
    }
  }

  model(params: Partial<StoreknoxInventoryPendingReviewsQueryParam>) {
    const { app_limit, app_offset } = params;

    this.skPendingReview
      .setLimitOffset({
        limit: app_limit,
        offset: app_offset,
      })
      .reload();

    // To get inventory list count in tabs when page is visited for the first time
    this.skAppsService.reload();
  }
}
