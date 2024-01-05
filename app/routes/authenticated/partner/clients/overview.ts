import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';

import MeService from 'irene/services/me';

export default class AuthenticatedPartnerClientsOverviewRoute extends Route {
  @service declare me: MeService;
  @service declare router: RouterService;

  beforeModel(): void {
    if (!this.me.org?.can_access_partner_dashboard) {
      this.router.transitionTo('authenticated.projects');
    }
  }
}
