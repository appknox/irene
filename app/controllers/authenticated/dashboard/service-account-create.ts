import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardServiceAccountCreateController extends Controller {
  @service declare intl: IntlService;

  queryParams = ['duplicate'];
  duplicate = null;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('create'),
      route: 'authenticated.dashboard.service-account-create',
      routeGroup: 'organization',

      parentCrumb: {
        title: this.intl.t('serviceAccount'),
        route: 'authenticated.dashboard.organization-settings.service-account',
        routeGroup: 'organization',
      },
    };
  }
}
