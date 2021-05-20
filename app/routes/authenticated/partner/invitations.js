import Route from '@ember/routing/route';
import {
  inject as service
} from '@ember/service';

export default class AuthenticatedPartnerInvitationsRoute extends Route {

  @service me;
  @service partner;
  beforeModel() {
    // Redirect to projects
    if (!this.get('me.org.can_access_partner_dashboard')) {
      this.transitionTo('authenticated.partner.clients');
    } else if (!this.partner.access.invite_clients) { //Redirect to clients, if privilege is not set
      this.transitionTo('authenticated.partner.clients');
    }
  }
}
