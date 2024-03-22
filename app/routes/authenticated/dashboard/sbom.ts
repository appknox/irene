import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';

import OrganizationService from 'irene/services/organization';

export default class AuthenticatedDashboardSbomRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  beforeModel() {
    if (!this.organization.selected?.features?.sbom) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }
}
