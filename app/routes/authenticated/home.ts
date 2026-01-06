import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';

export default class HomeRoute extends Route {
  @service declare me: MeService;
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  get isSecurityEnabled() {
    return this.me.org?.has_security_permission;
  }

  beforeModel() {
    const securityDashboard = this.isSecurityEnabled;
    const storeknox = this.organization.selected?.features?.storeknox;

    if (!storeknox && !securityDashboard) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }
}
