import Ember from 'ember';
import ENV from 'irene/config/environment';
import {isUnauthorizedError} from 'ember-ajax/errors';

const LoginComponentComponent = Ember.Component.extend({
  session: Ember.inject.service('session'),
  notify: Ember.inject.service('notification-messages-service'),
  MFAEnabled: false,
  isLogingIn: false,
  isSSOLogingIn: false,
  identification: "",
  password: "",
  otp: "",
  isNotEnterprise: !ENV.isEnterprise,
  actions: {
    authenticate() {
      let identification = this.get('identification');
      let password = this.get('password');
      const otp = this.get("otp");

      if (!identification || !password) {
        return this.get("notify").error("Please enter username and password", ENV.notifications);
      }
      identification = identification.trim();
      password = password.trim();
      this.set("isLogingIn", true);

      const errorCallback = (error) => {
        if (isUnauthorizedError(error)) {
          this.set("MFAEnabled", true);
        }
      };

      const loginStatus = () => {
        this.set("isLogingIn", false);
      };

      this.get('session').authenticate("authenticator:irene", identification, password, otp, errorCallback, loginStatus);
    },

    SSOAuthenticate() {
      this.set("isSSOLogingIn", true);
      const url = `${ENV.endpoints.saml2}?return_to=${window.location.origin}/saml2/redirect`;

      this.get("ajax").request(url)
        .then(function(data) {
          window.location.href = data.url;
        })
        .catch(function(err) {
          this.get("notify").error(err.payload.message);
        });
    }
  }
});

export default LoginComponentComponent;
