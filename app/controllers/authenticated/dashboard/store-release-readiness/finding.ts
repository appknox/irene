import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type StoreReleaseReadinessFindingModel from 'irene/models/store-release-readiness-finding';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardStoreReleaseReadinessFindingController extends Controller {
  @service declare intl: IntlService;

  declare model: {
    finding: StoreReleaseReadinessFindingModel;
    scanId: string;
  };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const { finding, scanId } = this.model;
    const policyDetailsTitle = this.intl.t(
      'storeReleaseReadiness.policyDetails'
    );

    return {
      title: policyDetailsTitle,
      route: 'authenticated.dashboard.store-release-readiness.finding',
      models: [scanId, finding.id],
      routeGroup: 'store-release-readiness',

      parentCrumb: {
        title: this.intl.t('storeReleaseReadiness.title'),
        routeGroup: 'store-release-readiness',
        route: 'authenticated.dashboard.store-release-readiness.scan-results',
        models: [scanId],
      },

      fallbackCrumbs: [
        {
          title: this.intl.t('storeReleaseReadiness.title'),
          route: 'authenticated.dashboard.store-release-readiness.index',
          routeGroup: 'store-release-readiness',
        },
        {
          title: this.intl.t('storeReleaseReadiness.title'),
          route: 'authenticated.dashboard.store-release-readiness.scan-results',
          models: [scanId],
          routeGroup: 'store-release-readiness',
        },
        {
          title: policyDetailsTitle,
          route: 'authenticated.dashboard.store-release-readiness.finding',
          models: [scanId, finding.id],
          routeGroup: 'store-release-readiness',
        },
      ],
    };
  }
}
