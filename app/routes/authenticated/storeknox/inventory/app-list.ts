import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { service } from '@ember/service';

import type SkPendingReviewService from 'irene/services/sk-pending-review';
import type SkInventoryAppService from 'irene/services/sk-inventory-apps';

export interface StoreknoxInventoryAppListQueryParams {
  app_limit: number;
  app_offset: number;
  monitoring_status: number;
}

export default class AuthenticatedStoreknoxInventoryAppListRoute extends AkBreadcrumbsRoute {
  @service declare skPendingReview: SkPendingReviewService;

  @service('sk-inventory-apps')
  declare skInventoryAppsService: SkInventoryAppService;

  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
    monitoring_status: {
      refreshModel: true,
    },
  };

  async model(params: Partial<StoreknoxInventoryAppListQueryParams>) {
    const { app_limit, app_offset, monitoring_status } = params;

    this.skInventoryAppsService
      .setQueryParams({
        limit: app_limit,
        offset: app_offset,
        monitoringStatusFilter: monitoring_status,
      })
      .reload();

    // To get pending review count in tabs when page is visited for the first time
    this.skPendingReview.reload();
  }
}
