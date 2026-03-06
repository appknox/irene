import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedStoreknoxInventoryDetailsFakeAppListIgnoredController extends Controller {
  @service declare intl: IntlService;

  declare model: { skInventoryApp: SkInventoryAppModel };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const id = this.model.skInventoryApp?.id;
    const pkg = this.model.skInventoryApp?.appMetadata?.packageName;

    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('storeknox.fakeApps.ignored'),
      route: 'authenticated.storeknox.inventory-details.fake-app-list.ignored',
      models: [id],
      routeGroup: 'storeknox/inventory',
      siblingRoutes: [
        'authenticated.storeknox.inventory-details.fake-app-list.index',
        'authenticated.storeknox.inventory-details.fake-app-list.fake-apps',
      ],
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
