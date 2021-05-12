import Route from '@ember/routing/route';
import {
  inject as service
} from '@ember/service';

export default class AuthenticatedPartnerClientsRoute extends Route {

  @service me;
  beforeModel() {
    // Redirect to projects
    if (!this.get('me.org.can_access_partner_dashboard')) {
      this.transitionTo('authenticated.projects');
    }
  }
}
