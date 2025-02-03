import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type OrganizationService from 'irene/services/organization';
import type { AppMonitoringDetailsQueryParams } from 'irene/routes/authenticated/dashboard/app-monitoring/monitoring-details';

export default class AuthenticatedDashboardAppMonitoringMonitoringDetailsHistoryRoute extends AkBreadcrumbsRoute {
  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service declare router: RouterService;

  parentRoute = 'authenticated.dashboard.app-monitoring.monitoring-details';

  beforeModel() {
    if (!this.organization.selected?.features.app_monitoring) {
      this.router.transitionTo('authenticated.dashboard.projects');
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
