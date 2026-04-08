import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type SkOrganizationService from 'irene/services/sk-organization';

export interface StoreknoxFakeAppsParams {
  sk_app: string;
}

export default class AuthenticatedStoreknoxFakeAppsRoute extends AkBreadcrumbsRoute {
  @service declare router: RouterService;
  @service declare skOrganization: SkOrganizationService;

  beforeModel() {
    if (!this.skOrganization.selected?.skFeatures.fake_app_detection) {
      this.router.transitionTo('authenticated.storeknox.inventory.app-list');
    }
  }
}
