import Ember from 'ember';
import ENV from 'irene/config/environment';
import {isUnauthorizedError} from 'ember-ajax/errors';

const LoginComponentComponent = Ember.Component.extend({
  session: Ember.inject.service('session'),
  notify: Ember.inject.service('notification-messages-service'),
  MFAEnabled: false,
  isLogingIn: false,
  identification: "",
  password: "",
  otp: "",
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
    }
  }
});

export default LoginComponentComponent;
