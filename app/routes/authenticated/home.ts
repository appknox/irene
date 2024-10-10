import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';

import OrganizationService from 'irene/services/organization';

export default class HomeRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  beforeModel() {
    if (!this.organization.selected?.features.app_monitoring) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }
}
