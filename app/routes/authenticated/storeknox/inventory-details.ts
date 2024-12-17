import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import RouterService from '@ember/routing/router-service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export interface InventoryDetailsIndexQueryParams {
  id: string | number;
}

export default class AuthenticatedStoreknoxInventoryDetailsIndexRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;
  @service declare router: RouterService;

  async model(
    params: InventoryDetailsIndexQueryParams
  ): Promise<SkInventoryAppModel> {
    const skInventoryApp = await this.store.findRecord(
      'sk-inventory-app',
      params.id
    );

    return skInventoryApp;
  }
}
