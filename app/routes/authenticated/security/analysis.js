import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

export default Ember.Route.extend(ScrollTopMixin, {
  title: `Analysis Details${config.platform}`,
});
