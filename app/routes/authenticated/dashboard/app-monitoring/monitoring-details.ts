import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';

import AmAppModel from 'irene/models/am-app';
import OrganizationService from 'irene/services/organization';
import AmConfigurationModel from 'irene/models/amconfiguration';

export interface AppMonitoringDetailsQueryParams {
  am_app_id: string | number;
}

export default class AuthenticatedDashboardAppMonitoringMonitoringDetailsRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service declare router: RouterService;

  beforeModel() {
    if (!this.organization.selected?.features.app_monitoring) {
      this.transitionTo('authenticated.dashboard.projects');
    }
  }

  async model(
    params: AppMonitoringDetailsQueryParams
  ): Promise<{ settings?: AmConfigurationModel; amApp: AmAppModel }> {
    const { am_app_id } = params;

    const amApp = await this.store.findRecord('am-app', am_app_id);

    const orgModel = this.organization.selected;
    const AmSettings = await orgModel?.get_am_configuration();

    return {
      settings: AmSettings,
      amApp,
    };
  }

  @action
  error(error: AdapterError) {
    if (error?.errors && error.errors[0]?.status === '404') {
      this.router.transitionTo('/not-found');
    }
  }
}
