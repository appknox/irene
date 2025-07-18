import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { StoreknoxInventoryAppListQueryParams } from 'irene/routes/authenticated/storeknox/inventory/app-list';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedStoreknoxAppListController extends Controller {
  @service declare intl: IntlService;

  declare model: { queryParams: StoreknoxInventoryAppListQueryParams };

  queryParams = ['app_limit', 'app_offset', 'monitoring_status'];

  app_limit = 10;
  app_offset = 0;
  monitoring_status = -1;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('storeknox.appInventory'),
      route: 'authenticated.storeknox.inventory.app-list',
      routeGroup: 'storeknox/inventory',
      stopCrumbGeneration: true,
      isRootCrumb: true,
    };
  }
}
