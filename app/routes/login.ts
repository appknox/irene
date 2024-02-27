import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';

import ENV from 'irene/config/environment';

export default class LoginRoute extends Route {
  @service declare session: any;
  @service declare router: RouterService;

  activate() {
    if (this.session.isAuthenticated) {
      this.router.transitionTo(
        ENV['ember-simple-auth']['routeIfAlreadyAuthenticated']
      );
    }
  }
}
