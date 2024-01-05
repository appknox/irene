import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';

import ENV from 'irene/config/environment';
import config from 'irene/config/environment';

interface Saml2RedirectParams {
  sso_token: string;
  err?: string;
}

export default class Saml2RedirectRoute extends Route {
  @service declare session: any;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  title = `Redirect${config.platform}`;

  queryParams = {
    sso_token: {
      refreshModel: true,
    },
    err: {
      refreshModel: true,
    },
  };

  model(params: Saml2RedirectParams) {
    if (params.err) {
      this.router.transitionTo('login');

      this.notify.error(params.err, ENV.notifications);

      return;
    }

    this.session.authenticate('authenticator:saml2', params.sso_token);
  }
}
