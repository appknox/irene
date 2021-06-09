import Route from '@ember/routing/route';
import { ScrollTopMixin } from '../../mixins/scroll-top';
import { inject as service } from '@ember/service';

export default class AuthenticatedAnalyticsRoute extends ScrollTopMixin(Route) {
  @service me;
  @service analytics;

  beforeModel() {
    if (this.get('me.org.is_member')) {
      this.transitionTo('authenticated.projects');
    }
  }

  async model() {
    await this.get('analytics').load();
  }
}
