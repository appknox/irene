import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardOffensiveSecurityIndexController extends Controller {
  @service declare intl: IntlService;

  queryParams = [
    {
      scan_limit: { type: 'number' as const },
    },
    {
      scan_offset: { type: 'number' as const },
    },
    {
      scan_query: { type: 'string' as const },
    },
    {
      scan_platform: { type: 'string' as const },
    },
    {
      scan_resilience: { type: 'string' as const },
    },
    {
      scan_sort: { type: 'string' as const },
    },
  ];

  scan_limit = 25;
  scan_offset = 0;
  scan_query = '';
  scan_platform = 'all';
  scan_resilience = 'all';
  scan_sort = 'desc';

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('offensiveSecurity.title'),
      route: 'authenticated.dashboard.offensive-security.index',
      routeGroup: 'offensive-security',
    };
  }
}
