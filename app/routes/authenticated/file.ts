import Route from '@ember/routing/route';
import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';
import { inject as service } from '@ember/service';

export default class AuthenticatedFileRoute extends Route {
  @service declare router: RouterService;

  beforeModel(transition: Transition) {
    const { params } = transition.to || {};

    if (params) {
      this.router.transitionTo(
        'authenticated.dashboard.file',
        params['fileid'] as string
      );
    }
  }
}
