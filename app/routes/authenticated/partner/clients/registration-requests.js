import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedPartnerRegistrationRequestsRoute extends Route {
  @service me;
  @service partner;

  beforeModel() {
    if (
      !this.me.get('org.can_access_partner_dashboard') ||
      !this.partner.get('access.admin_registration')
    ) {
      this.transitionTo('authenticated.partner.clients');
    }
  }
}
