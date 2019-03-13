import config from 'irene/config/environment';
import Route from '@ember/routing/route';

import { inject as service } from '@ember/service';

export default Route.extend({
  title: `Redirect${config.platform}`,
  session: service('session'),
  model(params) {
    this.get('session').authenticate("authenticator:saml2", params.sso_token);
  },
  queryParams: {
    sso_token: {
      refreshModel: true
    }
  }
});
