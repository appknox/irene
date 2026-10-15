import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedOffensiveSecurityNewAssessmentController extends Controller {
  @service declare intl: IntlService;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const title = this.intl.t('offensiveSecurity.newAssessment');

    return {
      title,
      route: 'authenticated.offensive-security.new-assessment',
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
          title,
          route: 'authenticated.offensive-security.new-assessment',
          routeGroup: 'offensive-security',
        },
      ],
    };
  }
}
