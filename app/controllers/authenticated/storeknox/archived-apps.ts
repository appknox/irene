import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedStoreknoxArchivedAppsController extends Controller {
  @service declare intl: IntlService;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('storeknox.archivedApps'),
      route: 'authenticated.storeknox.archived-apps',
      routeGroup: 'storeknox/inventory',

      parentCrumb: {
        title: this.intl.t('storeknox.appInventory'),
        routeGroup: 'storeknox/inventory',
        route: 'authenticated.storeknox.inventory.app-list',
      },
    };
  }
}
