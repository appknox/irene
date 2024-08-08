import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';

export default class AuthenticatedDashboardPublicApiRoute extends Route {
  @service declare me: MeService;
  @service declare router: RouterService;
  @service declare organization: OrganizationService;

  beforeModel() {
    const isOwner = this.me.org?.is_owner;
    const isAdmin = this.me.org?.is_admin;
    const publicAPIEnabled = this.organization?.selected?.features?.public_apis;
    const canAccessRoute = (isOwner || isAdmin) && publicAPIEnabled;

    if (!canAccessRoute) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }
}
