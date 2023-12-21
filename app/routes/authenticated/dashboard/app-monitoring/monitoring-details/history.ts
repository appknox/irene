import Route from '@ember/routing/route';
import OrganizationService from 'irene/services/organization';
import Store from '@ember-data/store';
import { inject as service } from '@ember/service';
import { AppMonitoringDetailsQueryParams } from 'irene/routes/authenticated/dashboard/app-monitoring/monitoring-details';

export default class AuthenticatedDashboardAppMonitoringMonitoringDetailsHistoryRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare store: Store;

  parentRoute = 'authenticated.dashboard.app-monitoring.monitoring-details';

  beforeModel() {
    if (!this.organization.selected?.features.app_monitoring) {
      this.transitionTo('authenticated.projects');
    }
  }

  async model() {
    const { am_app_id } = this.paramsFor(
      this.parentRoute
    ) as AppMonitoringDetailsQueryParams;

    const amApp = this.store.peekRecord('am-app', am_app_id);

    return amApp;
  }
}
