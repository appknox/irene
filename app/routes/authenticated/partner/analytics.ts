import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';

import OrganizationService from 'irene/services/organization';
import PartnerService from 'irene/services/partner';

export default class AuthenticatedPartnerAnalyticsRoute extends Route {
  @service declare partner: PartnerService;
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  beforeModel(): void {
    if (!this.organization.selected?.features.partner_dashboard) {
      this.router.transitionTo('authenticated.projects');
    }

    if (!this.partner.access?.view_analytics) {
      this.router.transitionTo('authenticated.partner.clients');
    }
  }
}
