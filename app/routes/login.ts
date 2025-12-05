import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import type { SessionService } from 'irene/adapters/auth-base';

export default class LoginRoute extends Route {
  @service declare session: SessionService;
  @service declare router: RouterService;
  @service declare notifications: NotificationService;
  @service declare intl: IntlService;
  @service('browser/window') declare window: Window;

  queryParams = {
    sessionExpired: {
      refreshModel: false,
    },
  };

  activate() {
    if (this.session.isAuthenticated) {
      this.router.transitionTo(
        ENV['ember-simple-auth']['routeIfAlreadyAuthenticated']
      );
    }
  }

  beforeModel(transition: Transition) {
    const sessionExpired = transition.to?.queryParams?.['sessionExpired'];
    const userInactive = transition.to?.queryParams?.['userInactive'];

    if (sessionExpired) {
      this.notifications.info(this.intl.t('pleaseLoginAgain'), {
        autoClear: true,
      });

      // Clean the query parameter from the URL
      const url = new URL(this.window.location.href);
      url.searchParams.delete('sessionExpired');
      this.window.history.replaceState({}, '', url.toString());
    } else if (userInactive) {
      this.notifications.error(this.intl.t('loginFailed'), {
        autoClear: true,
      });

      // Clean the query parameter from the URL
      const url = new URL(this.window.location.href);
      url.searchParams.delete('userInactive');
      this.window.history.replaceState({}, '', url.toString());
    }
  }
}
