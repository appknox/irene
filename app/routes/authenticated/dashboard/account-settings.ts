import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import Transition from '@ember/routing/transition';
import { inject as service } from '@ember/service';

import UserModel from 'irene/models/user';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedDashboardSettingsRoute extends ScrollToTop(
  Route
) {
  @service declare router: RouterService;

  model() {
    return this.modelFor('authenticated') as UserModel;
  }

  redirect(model: unknown, transition: Transition) {
    const currentRoute = transition.to?.name;

    if (currentRoute === 'authenticated.dashboard.account-settings.index') {
      this.router.transitionTo(
        'authenticated.dashboard.account-settings.general'
      );
    }
  }
}
