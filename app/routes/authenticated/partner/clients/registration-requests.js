import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class AuthenticatedPartnerRegistrationRequestsRoute extends Route {
  @service me;
  @service partner;

  beforeModel() {
    if (!this.get('me.org.can_access_partner_dashboard') || !this.partner.access.invite_clients) {
      this.transitionTo('authenticated.partner.clients');
    }
  }
}
