import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import Transition from '@ember/routing/transition';
import { inject as service } from '@ember/service';

export default class AuthenticatedOrganizationRoute extends Route {
  @service declare router: RouterService;

  redirect(model: unknown, transition: Transition) {
    const currentPath = transition.to?.name;

    if (
      currentPath === 'authenticated.organization' ||
      currentPath === 'authenticated.organization.namespaces'
    ) {
      this.router.transitionTo(
        'authenticated.dashboard.organization.namespaces'
      );
    } else if (currentPath === 'authenticated.organization.users') {
      this.router.transitionTo('authenticated.dashboard.organization.users');
    } else if (currentPath === 'authenticated.organization.teams') {
      this.router.transitionTo('authenticated.dashboard.organization.teams');
    }
  }
}
