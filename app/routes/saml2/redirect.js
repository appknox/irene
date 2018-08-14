import Ember from 'ember';
import config from 'irene/config/environment';
import ENV from 'irene/config/environment';

export default Ember.Route.extend({
  title: `Redirect${config.platform}`,
  session: Ember.inject.service('session'),
  model(params) {
    this.get('session').authenticate("authenticator:saml2", params.sso_token);
  },
  queryParams: {
    sso_token: {
      refreshModel: true
    }
  }
});
