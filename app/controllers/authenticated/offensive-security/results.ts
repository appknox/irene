import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import type OffsecScanModel from 'irene/models/offsec-scan';

export default class AuthenticatedOffensiveSecurityResultsController extends Controller {
  @service declare intl: IntlService;

  queryParams = ['goal'];

  @tracked goal: string | null = null;

  declare model: OffsecScanModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const scanTitle =
      this.model?.displayName || this.intl.t('offensiveSecurity.attackRun');
    const scanId = this.model?.id;
    const title = this.intl.t('offensiveSecurity.results');

    return {
      title,
      route: 'authenticated.offensive-security.results',
      models: [scanId],
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
          title,
          route: 'authenticated.offensive-security.results',
          models: [scanId],
          routeGroup: 'offensive-security',
        },
      ],
    };
  }

  @action
  handleGoalParamChange(goalId: string | null): void {
    this.goal = goalId;
  }
}
