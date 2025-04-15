import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type ServiceAccountModel from 'irene/models/service-account';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedAdminServiceAccountCreateController extends Controller {
  @service declare intl: IntlService;

  declare model: {
    duplicateServiceAccount: ServiceAccountModel | null;
  };

  queryParams = ['duplicate'];
  duplicate = null;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('create'),
      route: 'authenticated.admin.service-account.create',
      routeGroup: 'admin',

      parentCrumb: {
        title: this.intl.t('serviceAccountModule.adminServiceAccount'),
        route: 'authenticated.admin.service-account.index',
        routeGroup: 'admin',
      },
    };
  }
}
