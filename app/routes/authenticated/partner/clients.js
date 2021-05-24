import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class AuthenticatedPartnerClientsRoute extends Route {
  @service me;

  beforeModel() {
    if (!this.me.get('org.can_access_partner_dashboard')) {
      this.replaceWith('authenticated.projects');
    }
  }
}
