import Ember from 'ember';
import config from 'irene/config/environment';
import ENV from 'irene/config/environment';

export default Ember.Route.extend({
  title: `Activate${config.platform}`,
  model(params) {
    const url = [ENV.endpoints.activate, params.pk, params.token].join('/');
    return this.get('ajax').request(url);
  },
  redirect() {
    this.get("notify").info("Your account has been activated. Please login to continue");
    this.transitionTo('login');
  }
});
