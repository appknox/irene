import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedOrganizationUsersController extends Controller {
  @service declare intl: IntlService;

  queryParams = [
    {
      user_limit: { type: 'number' as const },
    },
    {
      user_offset: { type: 'number' as const },
    },
    {
      user_query: { type: 'string' as const },
    },
    {
      show_inactive_user: { type: 'boolean' as const },
    },
    {
      invite_limit: { type: 'number' as const },
    },
    {
      invite_offset: { type: 'number' as const },
    },
  ];

  user_limit = 10;
  user_offset = 0;
  user_query = '';
  show_inactive_user = false;
  invite_limit = 10;
  invite_offset = 0;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('organization'),
      route: 'authenticated.dashboard.organization.users',
      routeGroup: 'organization',

      siblingRoutes: [
        'authenticated.dashboard.organization.namespaces',
        'authenticated.dashboard.organization.teams',
      ],

      isRootCrumb: true,
      stopCrumbGeneration: true,
    };
  }
}
