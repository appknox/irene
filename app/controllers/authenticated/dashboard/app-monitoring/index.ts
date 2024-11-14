import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardAppMonitoringIndexController extends Controller {
  @service declare intl: IntlService;

  queryParams = ['app_limit', 'app_offset'];

  app_limit = 10;
  app_offset = 0;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('appMonitoring'),
      route: 'authenticated.dashboard.app-monitoring.index',
      routeGroup: 'app-monitoring',
      isRootCrumb: true,
      stopCrumbGeneration: true,
    };
  }
}
