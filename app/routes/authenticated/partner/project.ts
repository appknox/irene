import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Store from '@ember-data/store';
import RouterService from '@ember/routing/router-service';

import OrganizationService from 'irene/services/organization';
import PartnerService from 'irene/services/partner';

interface RouteParams {
  client_id: string;
  project_id: string;
}

export default class AuthenticatedPartnerProjectRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare partner: PartnerService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  async beforeModel() {
    if (!this.organization.selected?.features?.partner_dashboard) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }

    if (!this.partner.access?.list_files) {
      this.router.transitionTo('authenticated.partner.clients');
    }
  }

  async model(params: RouteParams) {
    return {
      client: await this.store.findRecord(
        'partner/partnerclient',
        params.client_id
      ),

      project: await this.store.queryRecord('partner/partnerclient-project', {
        clientId: params.client_id,
        projectId: params.project_id,
      }),
    };
  }

  @action
  error() {
    this.notify.error('Problem with viewing files!');
    this.router.transitionTo('authenticated.partner.clients');
  }
}
