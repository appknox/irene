import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedStoreknoxInventoryDetailsController extends Controller {
  @service declare intl: IntlService;

  declare model: SkInventoryAppModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: `${this.intl.t('storeknox.inventoryDetails')} (${this.model?.appMetadata?.packageName})`,
      route: 'authenticated.storeknox.inventory-details.index',
      models: [this.model?.id],
      routeGroup: 'storeknox/inventory',

      parentCrumb: {
        title: this.intl.t('storeknox.appInventory'),
        routeGroup: 'storeknox/inventory',
        route: 'authenticated.storeknox.inventory.app-list',
      },
    };
  }
}
