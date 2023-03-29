import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import OrganizationService from 'irene/services/organization';
import AmAppModel from 'irene/models/am-app';
import Store from '@ember-data/store';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';

export interface AppMonitoringDetailsQueryParams {
  am_app_id: string | number;
}

export default class AuthenticatedDashboardAppMonitoringMonitoringDetailsRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service declare router: RouterService;

  beforeModel() {
    if (!this.organization.selected?.features.app_monitoring) {
      this.transitionTo('authenticated.projects');
    }
  }

  async model(params: AppMonitoringDetailsQueryParams): Promise<AmAppModel> {
    const { am_app_id } = params;

    const amApp = await this.store.findRecord('am-app', am_app_id);

    return amApp;
  }

  @action
  error(error: AdapterError) {
    if (error?.errors && error.errors[0]?.status === '404') {
      this.router.transitionTo('/not-found');
    }
  }
}
