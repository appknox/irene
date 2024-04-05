import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import Transition from '@ember/routing/transition';
import { inject as service } from '@ember/service';

export default class AuthenticatedSettingsRoute extends Route {
  @service declare router: RouterService;

  redirect(model: unknown, transition: Transition) {
    const currentPath = transition.to?.name;

    if (
      currentPath === 'authenticated.account-settings.index' ||
      currentPath === 'authenticated.account-settings.general'
    ) {
      this.router.transitionTo(
        'authenticated.dashboard.account-settings.general'
      );
    } else if (currentPath === 'authenticated.account-settings.security') {
      this.router.transitionTo(
        'authenticated.dashboard.account-settings.security'
      );
    } else if (
      currentPath === 'authenticated.account-settings.developersettings'
    ) {
      this.router.transitionTo(
        'authenticated.dashboard.account-settings.developersettings'
      );
    }
  }
}
