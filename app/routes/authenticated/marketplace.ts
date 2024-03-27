import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import Transition from '@ember/routing/transition';

export default class AuthenticatedMarketPlaceRoute extends Route {
  @service declare router: RouterService;

  beforeModel(transition: Transition) {
    const { params } = transition.to || {};

    if (params) {
      this.router.transitionTo('authenticated.dashboard.marketplace');
    }
  }
}
