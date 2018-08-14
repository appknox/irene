import Ember from 'ember';
import ENV from 'irene/config/environment';
import {isUnauthorizedError} from 'ember-ajax/errors';

const SSOLoginComponentComponent = Ember.Component.extend({
  isLogingIn: false,
  actions: {
    SSOAuthenticate() {
      const loginStatus = () => {
        this.set("isLogingIn", false);
      };
    }
  }
});

export default SSOLoginComponentComponent;
