import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type OrganizationService from 'irene/services/organization';

export default class AuthenticatedStoreknoxInventoryDetailsBrandAbuseRoute extends AkBreadcrumbsRoute {
  @service declare router: RouterService;
  @service declare organization: OrganizationService;

  get skInventoryApp() {
    return this.modelFor(
      'authenticated.storeknox.inventory-details'
    ) as SkInventoryAppModel;
  }

  beforeModel() {
    // Redirect user to details page if feature is not enabled or if the user is on a plan that doesn't allow brand abuse insights
    if (this.organization.hideUpsellUI) {
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
