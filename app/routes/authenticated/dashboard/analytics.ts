import Route from '@ember/routing/route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';

import MeService from 'irene/services/me';

export default class AuthenticatedDashboardAnalyticsRoute extends ScrollToTop(
  Route
) {
  @service declare me: MeService;
  @service declare router: RouterService;

  beforeModel() {
    if (this.me.org?.get('is_member')) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }
}
