import Ember from 'ember';
import ENV from 'irene/config/environment';
import {isUnauthorizedError} from 'ember-ajax/errors';

const SSOLoginComponentComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  isLogingIn: false,
  actions: {
    SSOAuthenticate() {
      this.set("isLogingIn", true);
      const url = `${ENV.endpoints.saml2}?return_to=${window.location.origin}/saml2/redirect`;

      const loginStatus = () => {
        this.set("isLogingIn", false);
      };

      this.get("ajax").request(url)
        .then(function(data) {
          window.location.href = data.url;
        })
        .catch(function(err) {
          this.get("notify").error(error.payload.message);
        })
        .finally(function() {
          loginStatus();
        });
    }
  }
});

export default SSOLoginComponentComponent;
