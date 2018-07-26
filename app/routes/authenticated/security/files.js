import config from 'irene/config/environment';
import Ember from 'ember';

export default Ember.Route.extend({
  title: `All Files${config.platform}`,
});
