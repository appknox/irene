import Store from '@ember-data/store';
import { service } from '@ember/service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type OrganizationService from 'irene/services/organization';
import type { AppMonitoringDetailsQueryParams } from 'irene/routes/authenticated/dashboard/app-monitoring/monitoring-details';

export default class AuthenticatedDashboardAppMonitoringMonitoringDetailsIndexRoute extends AkBreadcrumbsRoute {
  @service declare organization: OrganizationService;
  @service declare store: Store;

  parentRoute = 'authenticated.dashboard.app-monitoring.monitoring-details';

  beforeModel() {
    if (!this.organization.selected?.features.app_monitoring) {
      this.transitionTo('authenticated.dashboard.projects');
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
