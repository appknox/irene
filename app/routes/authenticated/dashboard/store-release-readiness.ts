import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type OrganizationService from 'irene/services/organization';

import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedDashboardStoreReleaseReadinessRoute extends ScrollToTop(
  Route
) {
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  beforeModel() {
    if (this.organization.hideUpsellUIStatus.storeReleaseReadiness) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }

  model() {
    return {
      isStoreReleaseReadinessEnabled:
        this.organization.selected?.features?.store_release_readiness,
    };
  }
}
