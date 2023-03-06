// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import Route from '@ember/routing/route';
import OrganizationService from 'irene/services/organization';
import Store from '@ember-data/store';
import { inject as service } from '@ember/service';
import AmAppVersionModel from 'irene/models/am-app-version';
import { MonitoringDetailsQueryParams } from 'irene/routes/authenticated/app-monitoring/monitoring-details';

export default class AuthenticatedAppMonitoringMonitoringDetailsIndexRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare store: Store;

  parentRoute = 'authenticated.app-monitoring.monitoring-details';

  beforeModel() {
    if (!this.organization.selected?.features.app_monitoring) {
      this.transitionTo('authenticated.projects');
    }
  }

  async model(): Promise<DS.AdapterPopulatedRecordArray<AmAppVersionModel>> {
    const { am_app_id } = this.paramsFor(
      this.parentRoute
    ) as MonitoringDetailsQueryParams;

    const amAppVersions = await this.store.query('am-app-version', {
      amAppId: am_app_id,
    });

    return amAppVersions;
  }
}
