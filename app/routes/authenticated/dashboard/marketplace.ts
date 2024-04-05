import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';

import ENV from 'irene/config/environment';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedDashboardMarketPlaceRoute extends ScrollToTop(
  Route
) {
  @service declare router: RouterService;

  beforeModel() {
    if (!ENV.enableMarketplace) {
      this.router.transitionTo('/');
    }
  }
}
