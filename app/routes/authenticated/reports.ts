import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type OrganizationService from 'irene/services/organization';

export default class AuthenticatedReportsRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  async beforeModel() {
    if (!this.organization.selected?.aiFeatures?.reporting) {
      this.router.transitionTo('authenticated.home');
    }
  }
}
