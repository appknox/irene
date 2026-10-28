import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import type OffsecScanModel from 'irene/models/offsec-scan';

export default class AuthenticatedOffensiveSecurityScanController extends Controller {
  @service declare intl: IntlService;

  queryParams = ['goal'];

  @tracked goal: string | null = null;

  declare model: OffsecScanModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const scanTitle =
      this.model?.displayName || this.intl.t('offensiveSecurity.attackRun');
    const scanId = this.model?.id;

    return {
      title: scanTitle,
      route: 'authenticated.offensive-security.scan',
      models: [scanId],
      routeGroup: 'offensive-security',

      parentCrumb: {
        title: this.intl.t('offensiveSecurity.attackRuns'),
        routeGroup: 'offensive-security',
        route: 'authenticated.offensive-security.index',
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
      ],
    };
  }
}
