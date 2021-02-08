import Route from '@ember/routing/route';
import {
  ScrollTopMixin
} from '../../mixins/scroll-top';
import {
  inject as service
} from '@ember/service';

export default class AuthenticatedAnalyticsRoute extends ScrollTopMixin(Route) {

  @service me;
  beforeModel() {
    if (this.get('me.org.is_member')) {
      this.transitionTo('authenticated.projects');
    }
  }

  model() {
    return this.modelFor("authenticated");
  }
}
