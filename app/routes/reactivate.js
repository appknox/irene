import Ember from 'ember';
import config from 'irene/config/environment';

export default Ember.Route.extend({
  title: `Reactivate${config.platform}`,
});
