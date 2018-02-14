/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import Ember from 'ember';
import config from 'irene/config/environment';
import ENV from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const IndexRoute = Ember.Route.extend(ScrollTopMixin, {
  title: `Home${config.platform}`,
  model() {
    return this.modelFor("authenticated");
  },
  beforeModel() {
    return this.transitionTo('/projects');
  }
}
);

export default IndexRoute;
