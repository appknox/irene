import { service } from '@ember/service';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type RouterService from '@ember/routing/router-service';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export default class AuthenticatedStoreknoxInventoryDetailsBrandAbuseRoute extends AkBreadcrumbsRoute {
  @service declare router: RouterService;

  get skInventoryApp() {
    return this.modelFor(
      'authenticated.storeknox.inventory-details'
    ) as SkInventoryAppModel;
  }

  beforeModel() {
    // Redirect user to details page if app status is being initialized or disabled
    if (
      this.skInventoryApp.appIsInInitializingState ||
      this.skInventoryApp.appIsInDisabledState
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
