import Ember from 'ember';
import config from 'irene/config/environment';

const RegisterRoute = Ember.Route.extend({
  title: `Register${config.platform}`
});

export default RegisterRoute;
