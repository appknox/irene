import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const IndexRoute = Ember.Route.extend(ScrollTopMixin, {
  title: `Home${config.platform}`,
  model() {
    this.modelFor("authenticated");
  },
  beforeModel() {
    this.transitionTo('/projects');
  }
}
);

export default IndexRoute;
