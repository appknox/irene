import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';

import ENV from 'irene/config/environment';
import config from 'irene/config/environment';

interface OidcSsoRedirectParams {
  oidc_token: string;
  err?: string;
}

export default class OidcSsoRedirectRoute extends Route {
  @service declare session: any;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  title = `Redirect${config.platform}`;

  queryParams = {
    oidc_token: {
      refreshModel: true,
    },
    err: {
      refreshModel: true,
    },
  };

  model(params: OidcSsoRedirectParams) {
    if (params.err) {
      this.router.transitionTo('login');

      this.notify.error(params.err, ENV.notifications);

      return;
    }

    this.session.authenticate('authenticator:oidc-sso', params.oidc_token);
  }
}
