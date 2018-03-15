import Ember from 'ember';
import config from 'irene/config/environment';

const ResetRoute = Ember.Route.extend({
  title: `Reset Password${config.platform}`,
  model(params) {
    return params;
  }
});

export default ResetRoute;
