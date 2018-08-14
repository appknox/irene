import Ember from 'ember';
import config from 'irene/config/environment';

const SSOLoginRoute = Ember.Route.extend({
  title: `SSOLogin${config.platform}`
});

export default SSOLoginRoute;
