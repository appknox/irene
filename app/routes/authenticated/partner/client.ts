import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type Store from 'ember-data/store';
import type RouterService from '@ember/routing/router-service';

import type OrganizationService from 'irene/services/organization';
import type PartnerService from 'irene/services/partner';

export default class AuthenticatedClientRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare partner: PartnerService;
  @service declare store: Store;
  @service declare router: RouterService;

  beforeModel() {
    if (!this.organization.selected?.features?.partner_dashboard) {
      this.router.transitionTo('authenticated.dashboard.projects');
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
