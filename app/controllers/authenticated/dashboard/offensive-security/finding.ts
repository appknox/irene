import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardOffensiveSecurityFindingController extends Controller {
  @service declare intl: IntlService;

  declare model: { scanId: string; findingId: string };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('offensiveSecurity.finding'),
      route: 'authenticated.dashboard.offensive-security.finding',
      models: [this.model.scanId, this.model.findingId],
      routeGroup: 'offensive-security',

      parentCrumb: {
        title: this.intl.t('offensiveSecurity.attackRun'),
        routeGroup: 'offensive-security',
        route: 'authenticated.dashboard.offensive-security.scan',
        models: [this.model.scanId],
      },

      fallbackCrumbs: [
        {
          title: this.intl.t('offensiveSecurity.title'),
          route: 'authenticated.dashboard.offensive-security.index',
          routeGroup: 'offensive-security',
        },
        {
          title: this.intl.t('offensiveSecurity.attackRun'),
          route: 'authenticated.dashboard.offensive-security.scan',
          models: [this.model.scanId],
          routeGroup: 'offensive-security',
        },
      ],
    };
  }
}
