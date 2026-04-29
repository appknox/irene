import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardStoreReleaseReadinessScanResultsController extends Controller {
  @service declare intl: IntlService;

  /** Scan id from the URL; detail is loaded in `StoreReleaseReadiness::ScanResults`. */
  declare model: string;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('scanResults'),
      route: 'authenticated.dashboard.store-release-readiness.scan-results',
      models: [this.model],
      routeGroup: 'store-release-readiness',

      parentCrumb: {
        title: this.intl.t('storeReleaseReadiness'),
        routeGroup: 'store-release-readiness',
        route: 'authenticated.dashboard.store-release-readiness.index',
      },

      fallbackCrumbs: [
        {
          title: this.intl.t('storeReleaseReadiness'),
          route: 'authenticated.dashboard.store-release-readiness.index',
          routeGroup: 'store-release-readiness',
        },
        {
          title: this.intl.t('scanResults'),
          route: 'authenticated.dashboard.store-release-readiness.scan-results',
          models: [this.model],
          routeGroup: 'store-release-readiness',
        },
      ],
    };
  }
}
