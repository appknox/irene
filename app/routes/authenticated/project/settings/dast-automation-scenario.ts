import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import Store from 'ember-data/store';
import RouterService from '@ember/routing/router-service';
import Transition from '@ember/routing/transition';

export default class AuthenticatedDashboardProjectSettingsDastAutomationRoute extends ScrollToTop(
  Route
) {
  @service declare store: Store;
  @service declare router: RouterService;

  async beforeModel(transition: Transition) {
    const params = this.paramsFor('authenticated.project') as Record<
      string,
      string
    >;

    const dastParams = transition.to?.params || {};

    if (params && dastParams) {
      this.router.transitionTo(
        'authenticated.dashboard.project.settings.dast-automation-scenario',
        params['projectid'] as string,
        dastParams['scenario_id'] as string
      );
    }
  }
}
