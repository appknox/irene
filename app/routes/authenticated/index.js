import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const IndexRoute = Route.extend(ScrollTopMixin, {
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
