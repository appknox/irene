import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type { OrganizationSettingsIntegrationsRouteModel } from 'irene/routes/authenticated/dashboard/organization-settings/integrations';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardOrganizationSettingsIntegrationsController extends Controller {
  @service declare intl: IntlService;

  declare model: OrganizationSettingsIntegrationsRouteModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('integration'),
      route: 'authenticated.dashboard.organization-settings.integrations',
      routeGroup: 'organization',

      siblingRoutes: [
        'authenticated.dashboard.organization-settings.service-account',
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
