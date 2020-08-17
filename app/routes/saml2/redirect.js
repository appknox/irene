import config from 'irene/config/environment';
import Route from '@ember/routing/route';
import ENV from 'irene/config/environment';
import { getOwner } from '@ember/application';

import { inject as service } from '@ember/service';

export default Route.extend({
  title: `Redirect${config.platform}`,
  session: service('session'),
  notify: service('notifications'),
  model(params) {
    if (params.err){
      const authenticatedRoute = getOwner(this).lookup("route:authenticated");
      authenticatedRoute.transitionTo('login');
      this.get('notify').error(params.err, ENV.notifications);
      return
    }
    this.get('session').authenticate("authenticator:saml2", params.sso_token);
  },
  queryParams: {
    sso_token: {
      refreshModel: true
    },
    err:{
      refreshModel: true
    }
  }
});
