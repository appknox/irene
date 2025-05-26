import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type OrganizationService from 'irene/services/organization';

export default class AuthenticatedDashboardOrganizationSettingsAiPoweredFeaturesRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  beforeModel() {
    if (this.organization.allSelectedOrgAiFeaturesDisabled) {
      this.router.transitionTo('authenticated.dashboard.organization-settings');
    }
  }
}
