import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import Transition from '@ember/routing/transition';
import { inject as service } from '@ember/service';

export default class AuthenticatedChooseRoute extends Route {
  @service declare router: RouterService;

  beforeModel(transition: Transition) {
    const { params } = transition.to || {};

    if (params) {
      this.router.transitionTo(
        'authenticated.dashboard.choose',
        params['fileid'] as string
      );
    }
  }
}
