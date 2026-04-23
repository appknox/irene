import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import type { StoreReleaseReadinessIndexQueryParam } from 'irene/routes/authenticated/dashboard/store-release-readiness/index';

export default class AuthenticatedDashboardStoreReleaseReadinessIndexController extends Controller {
  declare model: {
    queryParams: StoreReleaseReadinessIndexQueryParam;
  };

  @service declare intl: IntlService;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('storeReleaseReadiness'),
      routeGroup: 'store-release-readiness',
      route: 'authenticated.dashboard.store-release-readiness.index',
      isRootCrumb: true,
      stopCrumbGeneration: true,
    };
  }
}
