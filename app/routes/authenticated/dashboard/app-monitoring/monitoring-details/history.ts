// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import Route from '@ember/routing/route';
import OrganizationService from 'irene/services/organization';
import Store from '@ember-data/store';
import { inject as service } from '@ember/service';
import { AppMonitoringDetailsQueryParams } from '../monitoring-details';
import AmAppSyncModel from 'irene/models/am-app-sync';

export default class AuthenticatedDashboardAppMonitoringMonitoringDetailsHistoryRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare store: Store;

  parentRoute = 'authenticated.dashboard.app-monitoring.monitoring-details';

  beforeModel() {
    if (!this.organization.selected?.features.app_monitoring) {
      this.transitionTo('authenticated.projects');
    }
  }

  async model(): Promise<DS.AdapterPopulatedRecordArray<AmAppSyncModel>> {
    const { am_app_id } = this.paramsFor(
      this.parentRoute
    ) as AppMonitoringDetailsQueryParams;

    const amAppSyncs = await this.store.query('am-app-sync', {
      amAppId: am_app_id,
      limit: 4,
      offset: 0,
    });

    return amAppSyncs;
  }
}
