import { service } from '@ember/service';
import type Store from 'ember-data/store';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export interface StoreknoxFakeAppListRouteModel {
  skInventoryApp: SkInventoryAppModel;
}

export default class AuthenticatedStoreknoxFakeAppListRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  async model(params: {
    sk_app: string;
  }): Promise<StoreknoxFakeAppListRouteModel> {
    const skInventoryApp = await this.store.findRecord(
      'sk-inventory-app',
      params.sk_app
    );

    return { skInventoryApp };
  }
}
