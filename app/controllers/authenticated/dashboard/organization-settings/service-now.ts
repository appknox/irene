import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardOrganizationSettingsServiceNowController extends Controller {
  @service declare intl: IntlService;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('serviceNow.newTitle'),
      route: 'authenticated.dashboard.organization-settings.service-now',
      routeGroup: 'organization',
      parentCrumb: {
        title: this.intl.t('integration'),
        route: 'authenticated.dashboard.organization-settings.integrations',
        routeGroup: 'organization',
      },
    };
  }
}
