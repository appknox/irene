import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import type MeService from 'irene/services/me';
import type PartnerService from 'irene/services/partner';

export default class AuthenticatedPartnerInvitationsRoute extends Route {
  @service declare me: MeService;
  @service declare partner: PartnerService;
  @service declare router: RouterService;

  beforeModel() {
    if (!this.me.org?.can_access_partner_dashboard) {
      this.router.transitionTo('authenticated.partner.clients');
    }
  }
}
