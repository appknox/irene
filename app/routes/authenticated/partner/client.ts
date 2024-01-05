import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Store from '@ember-data/store';
import RouterService from '@ember/routing/router-service';

import OrganizationService from 'irene/services/organization';
import PartnerService from 'irene/services/partner';

export default class AuthenticatedClientRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare partner: PartnerService;
  @service declare store: Store;
  @service declare router: RouterService;

  beforeModel() {
    if (!this.organization.selected?.features?.partner_dashboard) {
      this.router.transitionTo('authenticated.projects');
    }
  }

  async model(data: { id: string }) {
    return {
      client: await this.store.findRecord('partner/partnerclient', data.id),
      partner: this.partner,
    };
  }

  @action
  error() {
    this.router.transitionTo('authenticated.partner.clients');
  }
}
