import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import type { StoreknoxInventoryDetailsFakeAppDetailsRouteModel } from 'irene/routes/authenticated/storeknox/fake-app-details';

export default class AuthenticatedStoreknoxFakeAppsFakeAppDetailsController extends Controller {
  @service declare intl: IntlService;

  declare model: StoreknoxInventoryDetailsFakeAppDetailsRouteModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const pkg = this.model?.skInventoryApp?.appMetadata?.packageName;

    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: `${this.intl.t('storeknox.inventoryDetails')} (${pkg})`,
      route: 'authenticated.storeknox.inventory-details.index',
      models: [this.model?.skInventoryApp.id],
      routeGroup: 'storeknox/inventory',
    };

    const crumb: AkBreadcrumbsItemProps = {
      title: `${this.intl.t('storeknox.fakeAppDetails')} (${pkg})`,
      route: 'authenticated.storeknox.fake-app-details',
      models: [this.model?.skInventoryApp.id, this.model?.fakeApp.id],
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
        crumb,
      ],
    };
  }
}
