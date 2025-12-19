import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import type OrganizationService from 'irene/services/organization';

export default class HomeRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  beforeModel() {
    const securityDashboard = this.organization.isSecurityEnabled;
    const storeknox = this.organization.selected?.features?.storeknox;

    if (!storeknox && !securityDashboard) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }
}
