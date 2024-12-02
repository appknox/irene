import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type AmAppModel from 'irene/models/am-app';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardAppMonitoringMonitoringDetailsIndexController extends Controller {
  @service declare intl: IntlService;

  declare model: AmAppModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('appMonitoringModule.monitoringDetails'),
      route: 'authenticated.dashboard.app-monitoring.monitoring-details.index',
      models: [this.model.id],
      routeGroup: 'app-monitoring',

      siblingRoutes: [
        'authenticated.dashboard.app-monitoring.monitoring-details.history',
      ],

      parentCrumb: {
        title: this.intl.t('appMonitoring'),
        route: 'authenticated.dashboard.app-monitoring.index',
        routeGroup: 'app-monitoring',
      },
    };
  }
}
