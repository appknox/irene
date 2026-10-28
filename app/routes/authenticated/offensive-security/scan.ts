import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type AuthenticatedOffensiveSecurityScanController from 'irene/controllers/authenticated/offensive-security/scan';

export default class AuthenticatedOffensiveSecurityScanRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;
  @service declare router: RouterService;

  queryParams = {
    goal: { replace: false },
  };

  async model({ scan_id }: { scan_id: string }) {
    return this.store.findRecord('offsec-scan', scan_id);
  }

  // Goal detail moved to the results page; keep old ?goal= links working
  redirect(model: { id: string }, transition: Transition) {
    const goal = transition.to?.queryParams?.['goal'];

    if (goal) {
      this.router.transitionTo(
        'authenticated.offensive-security.results',
        model.id,
        { queryParams: { goal } }
      );
    }
  }

  resetController(
    controller: AuthenticatedOffensiveSecurityScanController,
    isExiting: boolean
  ) {
    if (isExiting) {
      controller.set('goal', null);
    }
  }
}
