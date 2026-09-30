import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export default class AuthenticatedStoreknoxInventoryDetailsUnscannedVersionRoute extends AkBreadcrumbsRoute {
  @service declare router: RouterService;

  get skInventoryApp() {
    return this.modelFor(
      'authenticated.storeknox.inventory-details'
    ) as SkInventoryAppModel;
  }

  beforeModel() {
    const app = this.skInventoryApp;

    // A decommissioned app reports DISABLED but keeps its history viewable.
    const isDecommissionedWithHistory =
      app.isDecommissioned && app.hasStoreMonitoringData;

    // Redirect user to details page if app status is being initialized or disabled
    if (
      app.storeMonitoringStatusIsPending ||
      (app.storeMonitoringStatusIsDisabled &&
        !app.storeMonitoringStatusIsActionNeeded &&
        !isDecommissionedWithHistory)
    ) {
      this.router.transitionTo(
        'authenticated.storeknox.inventory-details.index',
        this.skInventoryApp.id
      );
    }
  }

  async model() {
    return this.skInventoryApp;
  }
}
