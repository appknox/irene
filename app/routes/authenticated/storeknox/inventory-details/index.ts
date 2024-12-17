import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export interface InventoryDetailsIndexQueryParams {
  id: string | number;
}

export default class AuthenticatedStoreknoxInventoryDetailsIndexRoute extends AkBreadcrumbsRoute {
  @service declare store: Store;
  @service declare router: RouterService;

  async model(): Promise<SkInventoryAppModel> {
    return this.modelFor(
      'authenticated.storeknox.inventory-details'
    ) as SkInventoryAppModel;
  }
}
