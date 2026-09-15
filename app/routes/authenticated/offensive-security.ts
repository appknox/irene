import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type OrganizationService from 'irene/services/organization';
import type UserModel from 'irene/models/user';

import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedOffensiveSecurityRoute extends ScrollToTop(
  Route
) {
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  beforeModel() {
    if (this.organization.hideUpsellUIStatus.offensiveSecurity) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }

  model() {
    const user = this.modelFor('authenticated') as UserModel;

    return {
      user,
      isOffensiveSecurityEnabled:
        this.organization.selected?.features?.offensive_security,
    };
  }
}
