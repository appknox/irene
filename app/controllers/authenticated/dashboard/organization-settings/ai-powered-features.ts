import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardOrganizationSettingsAiPoweredFeaturesController extends Controller {
  @service declare intl: IntlService;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('aiPoweredFeatures'),
      routeGroup: 'organization',
      route:
        'authenticated.dashboard.organization-settings.ai-powered-features',

      siblingRoutes: [
        'authenticated.dashboard.organization-settings.service-account',
        'authenticated.dashboard.organization-settings.integrations',
      ],

      parentCrumb: {
        title: this.intl.t('organizationSettings'),
        route: 'authenticated.dashboard.organization-settings.index',
        routeGroup: 'organization',
      },
    };
  }
}
