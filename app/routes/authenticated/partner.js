import Route from '@ember/routing/route';
import {
  inject as service
} from '@ember/service';

export default class AuthenticatedPartnerRoute extends Route {

  @service me;
  beforeModel() {
    // Redirect to projects
    if (!this.get('me.partner.show_partner_dashboard')) {
      this.transitionTo('authenticated.projects');
    }
  }
  model() {
    return []
  }
}
