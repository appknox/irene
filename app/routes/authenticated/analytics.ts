import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';

export default class AuthenticatedAnalyticsRoute extends Route {
  @service declare router: RouterService;

  beforeModel() {
    this.router.transitionTo('authenticated.dashboard.analytics');
  }
}
