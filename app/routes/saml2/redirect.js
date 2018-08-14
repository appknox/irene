import Ember from 'ember';
import config from 'irene/config/environment';
import ENV from 'irene/config/environment';

export default Ember.Route.extend({
  title: `Redirect${config.platform}`,
  model(params) {
    const data = {
      token: params.sso_token
    };
    return this.get("ajax").post(ENV.endpoints.saml2Login, {data});
  },
  queryParams: {
    sso_token: {
      refreshModel: true
    }
  }
});
