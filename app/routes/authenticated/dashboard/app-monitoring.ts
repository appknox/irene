import { service } from '@ember/service';
import Route from '@ember/routing/route';
import type RouterService from '@ember/routing/router-service';
import type OrganizationService from 'irene/services/organization';

export default class AuthenticatedDashboardAppMonitoringIndexRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  beforeModel() {
    if (!this.organization?.selected?.features?.storeknox) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }
}
