import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type ServiceAccountModel from 'irene/models/service-account';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardServiceAccountDetailsController extends Controller {
  @service declare intl: IntlService;

  declare model: {
    serviceAccount: ServiceAccountModel;
  };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('viewOrEdit'),
      route: 'authenticated.dashboard.service-account-details',
      models: [this.model.serviceAccount.id],
      routeGroup: 'organization',

      parentCrumb: {
        title: this.intl.t('serviceAccount'),
        route: 'authenticated.dashboard.organization-settings.service-account',
        routeGroup: 'organization',
      },
    };
  }
}
