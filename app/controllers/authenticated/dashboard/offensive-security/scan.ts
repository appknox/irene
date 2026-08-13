import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardOffensiveSecurityScanController extends Controller {
  @service declare intl: IntlService;

  declare model: string;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('offensiveSecurity.attackRun'),
      route: 'authenticated.dashboard.offensive-security.scan',
      models: [this.model],
      routeGroup: 'offensive-security',

      parentCrumb: {
        title: this.intl.t('offensiveSecurity.title'),
        routeGroup: 'offensive-security',
        route: 'authenticated.dashboard.offensive-security.index',
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
          models: [this.model],
          routeGroup: 'offensive-security',
        },
      ],
    };
  }
}
