import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';

/**
 * Legacy deep link to the unfiltered component list.
 *
 * The complete list is the `tab=complete` view of `scan-details`, so this route
 * only forwards there, carrying any list query params along. It replaces the
 * history entry so Back does not bounce through the redirect.
 */
export default class AuthenticatedDashboardSbomOriginalAnalysisRoute extends Route {
  @service declare router: RouterService;

  beforeModel(transition: Transition) {
    const params = transition.to?.params ?? {};
    const queryParams = { ...(transition.to?.queryParams ?? {}) };

    // Insights is the default tab when reachability ran; this link means the
    // complete list. Without reachability the tab param is dropped on arrival.
    queryParams['tab'] = 'complete';

    this.router.replaceWith(
      'authenticated.dashboard.sbom.scan-details',
      String(params['sbom_project_id']),
      String(params['sbom_file_id']),
      { queryParams }
    );
  }
}
