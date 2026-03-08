import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { StoreknoxInventoryDetailsFakeAppListRouteModel } from 'irene/routes/authenticated/storeknox/inventory-details/fake-app-list';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedStoreknoxInventoryDetailsFakeAppListIgnoredController extends Controller {
  @service declare intl: IntlService;

  declare model: StoreknoxInventoryDetailsFakeAppListRouteModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const id = this.model.skInventoryApp?.id;
    const pkg = this.model.skInventoryApp?.appMetadata?.packageName;
    const models = [id];

    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('storeknox.fakeApps.ignored'),
      route: 'authenticated.storeknox.inventory-details.fake-app-list.ignored',
      models,
      routeGroup: 'storeknox/inventory',
      siblingRoutes: [
        'authenticated.storeknox.inventory-details.fake-app-list.index',
        'authenticated.storeknox.inventory-details.fake-app-list.fake-apps',
      ],
    };

    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: `${this.intl.t('storeknox.inventoryDetails')} (${pkg})`,
      route: 'authenticated.storeknox.inventory-details.index',
      models,
      routeGroup: 'storeknox/inventory',
    };

    return {
      ...crumb,
      parentCrumb,
      fallbackCrumbs: [
        {
          title: this.intl.t('storeknox.appInventory'),
          routeGroup: 'storeknox/inventory',
          route: 'authenticated.storeknox.inventory.app-list',
        },
        parentCrumb,
        crumb,
      ],
    };
  }
}
