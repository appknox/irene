import Route from '@ember/routing/route';
import {
  inject as service
} from '@ember/service';

export default class AuthenticatedPartnerClientsRoute extends Route {

  @service organization;
  beforeModel() {
    // Redirect to projects
    if (!this.get('organization.selected.features.partner_dashboard')) {
      this.transitionTo('authenticated.projects');
    }
  }
}
