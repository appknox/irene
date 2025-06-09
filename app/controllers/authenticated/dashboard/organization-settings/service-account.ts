import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardOrganizationSettingsServiceAccountController extends Controller {
  @service declare intl: IntlService;

  queryParams = ['sa_limit', 'sa_offset', 'show_system_created'];

  sa_limit = 10;
  sa_offset = 0;
  show_system_created = false;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('serviceAccount'),
      route: 'authenticated.dashboard.organization-settings.service-account',
      routeGroup: 'organization',

      siblingRoutes: [
        'authenticated.dashboard.organization-settings.integrations',
        'authenticated.dashboard.organization-settings.ai-powered-features',
      ],

      parentCrumb: {
        title: this.intl.t('organizationSettings'),
        route: 'authenticated.dashboard.organization-settings.index',
        routeGroup: 'organization',
      },
    };
  }
}
