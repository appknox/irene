import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import RouterService from '@ember/routing/router-service';

import SkAppModel from 'irene/models/sk-app';

export interface InventoryDetailsIndexQueryParams {
  id: string | number;
}

export default class AuthenticatedStoreknoxInventoryDetailsIndexRoute extends Route {
  @service declare store: Store;
  @service declare router: RouterService;

  async model(params: InventoryDetailsIndexQueryParams): Promise<SkAppModel> {
    const skApp = await this.store.findRecord('sk-app', params.id);

    return skApp;
  }
}
