import Ember from 'ember';
import config from 'irene/config/environment';

export default Ember.Route.extend({
  title: `Activate${config.platform}`,
  model(params) {
    return this.get('ajax').request(
      '/activate/'+ params.pk + '/'+ params.token
    );
  },
  redirect() {
    this.get("notify").info("Your account has been activated. Please login to continue");
    this.transitionTo('login');
  }
});
