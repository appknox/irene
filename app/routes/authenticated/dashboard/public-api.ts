import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type OrganizationService from 'irene/services/organization';

export default class AuthenticatedDashboardPublicApiRoute extends Route {
  @service declare router: RouterService;
  @service declare organization: OrganizationService;

  beforeModel() {
    const publicAPIEnabled = this.organization?.selected?.features?.public_apis;

    if (!publicAPIEnabled) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }
}
