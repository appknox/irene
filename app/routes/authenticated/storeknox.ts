import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import type OrganizationService from 'irene/services/organization';
import type SkOrganizationService from 'irene/services/sk-organization';

export default class AuthenticatedStoreknoxRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare skOrganization: SkOrganizationService;
  @service declare router: RouterService;

  beforeModel() {
    if (!this.organization.selected?.features.storeknox) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }

  async model() {
    await this.skOrganization.load();
  }
}
