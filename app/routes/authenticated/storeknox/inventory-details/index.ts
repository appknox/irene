import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export default class AuthenticatedStoreknoxInventoryDetailsIndexRoute extends AkBreadcrumbsRoute {
  async model(): Promise<SkInventoryAppModel> {
    return this.modelFor(
      'authenticated.storeknox.inventory-details'
    ) as SkInventoryAppModel;
  }
}
