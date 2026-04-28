import { service } from '@ember/service';
import type Transition from '@ember/routing/transition';
import type RouterService from '@ember/routing/router-service';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

/**
 * Legacy URL: `/scan-results/:release_id/policy/:policy_id`.
 * Replaced by `/scan-results/:release_id/findings/:finding_id`.
 */
export default class AuthenticatedDashboardStoreReleaseReadinessScanResultsPolicyRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare router: RouterService;

  beforeModel(transition: Transition) {
    const findingId = transition.to?.params?.policy_id;
    const releaseId = transition.to?.params?.release_id;

    if (findingId && releaseId) {
      this.router.replaceWith(
        'authenticated.dashboard.store-release-readiness.finding',
        releaseId,
        findingId
      );
    } else if (findingId) {
      this.router.transitionTo(
        'authenticated.dashboard.store-release-readiness.index'
      );
    } else {
      this.router.transitionTo(
        'authenticated.dashboard.store-release-readiness.index'
      );
    }
  }
}
