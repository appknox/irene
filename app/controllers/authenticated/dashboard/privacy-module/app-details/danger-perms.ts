import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { PrivacyModuleDangerPermsModel } from 'irene/routes/authenticated/dashboard/privacy-module/app-details/danger-perms';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardPrivacyModuleAppDetailsDangerPermsController extends Controller {
  @service declare intl: IntlService;

  declare model: PrivacyModuleDangerPermsModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.model.file.name as string,
      route: 'authenticated.dashboard.privacy-module.app-details.danger-perms',
      models: [this.model.file.id],
      routeGroup: 'privacy-module',

      siblingRoutes: [
        'authenticated.dashboard.privacy-module.app-details.index',
        'authenticated.dashboard.privacy-module.app-details.pii',
        'authenticated.dashboard.privacy-module.app-details.geo-location',
      ],

      parentCrumb: {
        title: this.intl.t('privacyModule.title'),
        routeGroup: 'privacy-module',
        route: 'authenticated.dashboard.privacy-module.index',
      },

      fallbackCrumbs: [
        {
          title: this.intl.t('privacyModule.title'),
          routeGroup: 'privacy-module',
          route: 'authenticated.dashboard.privacy-module.index',
        },
        {
          title: this.model.file.name as string,
          route: 'authenticated.dashboard.privacy-module.app-details.index',
          models: [this.model.file.id],
          routeGroup: 'privacy-module',
        },
      ],
    };
  }
}
