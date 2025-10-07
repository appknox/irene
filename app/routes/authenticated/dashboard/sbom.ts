import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type OrganizationService from 'irene/services/organization';

export default class AuthenticatedDashboardSbomRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  beforeModel() {
    if (this.organization.hideUpsellUIStatus.sbom) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }

  model() {
    return { isSbomEnabled: !!this.organization.selected?.features?.sbom };
  }
}
