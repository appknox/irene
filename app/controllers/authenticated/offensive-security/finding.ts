import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import type OffsecScanModel from 'irene/models/offsec-scan';
import type OffsecFindingModel from 'irene/models/offsec-finding';

export default class AuthenticatedOffensiveSecurityFindingController extends Controller {
  @service declare intl: IntlService;

  declare model: { scan: OffsecScanModel; finding: OffsecFindingModel };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const scanTitle =
      this.model?.scan?.displayName ||
      this.intl.t('offensiveSecurity.attackRun');
    const findingTitle =
      this.model?.finding?.name || this.intl.t('offensiveSecurity.finding');
    const scanId = this.model?.scan?.id;
    const findingId = this.model?.finding?.id;

    return {
      title: findingTitle,
      route: 'authenticated.offensive-security.finding',
      models: [scanId, findingId],
      routeGroup: 'offensive-security',

      parentCrumb: {
        title: scanTitle,
        routeGroup: 'offensive-security',
        route: 'authenticated.offensive-security.scan',
        models: [scanId],
      },

      fallbackCrumbs: [
        {
          title: this.intl.t('offensiveSecurity.attackRuns'),
          route: 'authenticated.offensive-security.index',
          routeGroup: 'offensive-security',
        },
        {
          title: scanTitle,
          route: 'authenticated.offensive-security.scan',
          models: [scanId],
          routeGroup: 'offensive-security',
        },
        {
          title: findingTitle,
          route: 'authenticated.offensive-security.finding',
          models: [scanId, findingId],
          routeGroup: 'offensive-security',
        },
      ],
    };
  }
}
