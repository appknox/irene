import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type { OrganizationSettingsRouteModel } from 'irene/routes/authenticated/dashboard/organization-settings/index';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardOrganizationSettingsIndex extends Controller {
  @service declare intl: IntlService;

  declare model: OrganizationSettingsRouteModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('settings'),
      route: 'authenticated.dashboard.organization-settings',
      routeGroup: 'organization',

      parentCrumb: {
        title: this.intl.t('organization'),
        route: 'authenticated.dashboard.organization.users',
        routeGroup: 'organization',
      },
    };
  }
}
