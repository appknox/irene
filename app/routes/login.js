import Ember from 'ember';
import config from 'irene/config/environment';

const LoginRoute = Ember.Route.extend({

  title: `Login${config.platform}`});

export default LoginRoute;
