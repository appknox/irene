import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { StoreknoxInventoryDetailsFakeAppListRouteModel } from 'irene/routes/authenticated/storeknox/inventory-details/fake-app-list';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedStoreknoxInventoryDetailsFakeAppListFakeAppsController extends Controller {
  @service declare intl: IntlService;

  declare model: StoreknoxInventoryDetailsFakeAppListRouteModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const id = this.model.skInventoryApp?.id;
    const pkg = this.model.skInventoryApp?.appMetadata?.packageName;

    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('storeknox.fakeApps.fakeApp'),
      routeGroup: 'storeknox/inventory',
      models: [id],
      route:
        'authenticated.storeknox.inventory-details.fake-app-list.fake-apps',
    };

    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: `${this.intl.t('storeknox.inventoryDetails')} (${pkg})`,
      route: 'authenticated.storeknox.inventory-details.index',
      models: [id],
      routeGroup: 'storeknox/inventory',
    };

    return {
      ...crumb,
      parentCrumb,
      siblingRoutes: [
        'authenticated.storeknox.inventory-details.fake-app-list.index',
        'authenticated.storeknox.inventory-details.fake-app-list.ignored',
      ],
      fallbackCrumbs: [
        {
          title: this.intl.t('storeknox.fakeAppsTitle'),
          routeGroup: 'storeknox/inventory',
          route: 'authenticated.storeknox.inventory.app-list',
        },
        parentCrumb,
        crumb,
      ],
    };
  }
}
