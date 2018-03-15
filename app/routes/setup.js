import Ember from 'ember';
import config from 'irene/config/environment';

const SetupRoute = Ember.Route.extend({
  title: `Set Your Password${config.platform}`,
  model(params) {
    return params;
  }
});

export default SetupRoute;
