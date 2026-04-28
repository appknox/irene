import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { StoreReleaseReadinessCardData } from 'irene/components/store-release-readiness/release-card';
import type { AssessmentPolicyRow } from 'irene/components/store-release-readiness/scan-results';
import type StoreReleaseReadinessFindingModel from 'irene/models/store-release-readiness-finding';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardStoreReleaseReadinessFindingController extends Controller {
  @service declare intl: IntlService;

  declare model: {
    item: StoreReleaseReadinessCardData;
    policy: AssessmentPolicyRow;
    finding: StoreReleaseReadinessFindingModel;
    releaseId: string;
  };

  get pageTitle(): string {
    const p = this.model.policy;
    const policyTitle =
      p.titleLabel != null && p.titleLabel !== ''
        ? p.titleLabel
        : this.intl.t(`storeReleaseReadinessModule.${p.titleKey as string}`);

    return `${policyTitle} — ${this.intl.t('storeReleaseReadinessModule.policyDetails')}`;
  }

  get parentCrumbTitle(): string {
    const { item } = this.model;

    if (item.appName !== '') {
      return item.appName;
    }

    return this.intl.t('storeReleaseReadiness');
  }

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const { policy, releaseId } = this.model;
    const policyCrumbTitle =
      policy.titleLabel != null && policy.titleLabel !== ''
        ? policy.titleLabel
        : this.intl.t(
            `storeReleaseReadinessModule.${policy.titleKey as string}`
          );

    return {
      title: policyCrumbTitle,
      route: 'authenticated.dashboard.store-release-readiness.finding',
      models: [releaseId, policy.id],
      routeGroup: 'store-release-readiness',

      parentCrumb: {
        title: this.parentCrumbTitle,
        routeGroup: 'store-release-readiness',
        route: 'authenticated.dashboard.store-release-readiness.scan-results',
        models: [releaseId],
      },

      fallbackCrumbs: [
        {
          title: this.intl.t('storeReleaseReadiness'),
          route: 'authenticated.dashboard.store-release-readiness.index',
          routeGroup: 'store-release-readiness',
        },
        {
          title: this.parentCrumbTitle,
          route: 'authenticated.dashboard.store-release-readiness.scan-results',
          models: [releaseId],
          routeGroup: 'store-release-readiness',
        },
        {
          title: policyCrumbTitle,
          route: 'authenticated.dashboard.store-release-readiness.finding',
          models: [releaseId, policy.id],
          routeGroup: 'store-release-readiness',
        },
      ],
    };
  }
}
