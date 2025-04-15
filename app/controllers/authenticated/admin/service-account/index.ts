import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { OrganizationSettingsServiceAccountRouteQueryParams } from 'irene/routes/authenticated/dashboard/organization-settings/service-account';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedAdminServiceAccountIndexController extends Controller {
  @service declare intl: IntlService;

  declare model: {
    queryParams: OrganizationSettingsServiceAccountRouteQueryParams;
  };

  queryParams = ['sa_limit', 'sa_offset', 'show_system_created'];

  sa_limit = 10;
  sa_offset = 0;
  show_system_created = false;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('serviceAccountModule.adminServiceAccount'),
      route: 'authenticated.admin.service-account.index',
      routeGroup: 'organization',
      isRootCrumb: true,
    };
  }
}
