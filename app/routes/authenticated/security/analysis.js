import config from 'irene/config/environment';
import Ember from 'ember';

export default Ember.Route.extend({
  title: `Analysis Details${config.platform}`,
});
