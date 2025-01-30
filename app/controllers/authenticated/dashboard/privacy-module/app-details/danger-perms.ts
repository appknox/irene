import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type FileModel from 'irene/models/file';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardPrivacyModuleAppDetailsDangerPermsController extends Controller {
  @service declare intl: IntlService;

  declare model: FileModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.model.name as string,
      route: 'authenticated.dashboard.privacy-module.app-details.danger-perms',
      models: [this.model.id],
      routeGroup: 'privacy-module',

      siblingRoutes: [
        'authenticated.dashboard.privacy-module.app-details.index',
        'authenticated.dashboard.privacy-module.app-details.pii',
      ],

      parentCrumb: {
        title: 'Privacy Module',
        routeGroup: 'privacy-module',
        route: 'authenticated.dashboard.privacy-module.index',
      },

      fallbackCrumbs: [
        {
          title: 'Privacy Module',
          routeGroup: 'privacy-module',
          route: 'authenticated.dashboard.privacy-module.index',
        },
        {
          title: this.model.name as string,
          route: 'authenticated.dashboard.privacy-module.app-details.index',
          models: [this.model.id],
          routeGroup: 'privacy-module',
        },
      ],
    };
  }
}
