import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';
import Transition from '@ember/routing/transition';

export default class AuthenticatedAnalyticsRoute extends Route {
  @service declare router: RouterService;

  beforeModel(transition: Transition) {
    const { params } = transition.to || {};

    if (params) {
      this.router.transitionTo('authenticated.dashboard.analytics');
    }
  }
}
