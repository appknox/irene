/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import Ember from 'ember';
import ENV from 'irene/config/environment';
import {isUnauthorizedError} from 'ember-ajax/errors';

const LoginComponentComponent = Ember.Component.extend({
  session: Ember.inject.service('session'),
  MFAEnabled: false,
  actions: {
    authenticate() {
      const that = this;
      let identification = this.get('identification');
      let password = this.get('password');
      const otp = this.get("otp");

      if (!identification || !password) {
        return that.get("notify").error("Please enter username and password", ENV.notifications);
      }
      identification = identification.trim();
      password = password.trim();

      const errorCallback = function(error){
        if (isUnauthorizedError(error)) {
          return that.set("MFAEnabled", true);
        }
      };


      return this.get('session').authenticate("authenticator:irene", identification, password, otp, errorCallback);
    }
  }
});

export default LoginComponentComponent;
