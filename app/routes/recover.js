import Ember from 'ember';
import config from 'irene/config/environment';

const RecoverRoute = Ember.Route.extend({
  title: `Recover Password${config.platform}`});

export default RecoverRoute;
