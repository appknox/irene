import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import OrganizationService from 'irene/services/organization';
import AmAppModel from 'irene/models/am-app';
import Store from '@ember-data/store';

export interface MonitoringDetailsQueryParams {
  am_app_id: string | number;
}

export default class AuthenticatedAppMonitoringMonitoringDetailsRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare store: Store;

  beforeModel() {
    if (!this.organization.selected?.features.app_monitoring) {
      this.transitionTo('authenticated.projects');
    }
  }

  async model(params: MonitoringDetailsQueryParams): Promise<AmAppModel> {
    const { am_app_id } = params;

    const amApp = await this.store.findRecord('am-app', am_app_id);

    return amApp;
  }
}
