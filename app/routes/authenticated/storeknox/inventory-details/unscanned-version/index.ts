import Route from '@ember/routing/route';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export default class AuthenticatedStoreknoxInventoryDetailsUnscannedVersionIndexRoute extends Route {
  parentRoute = 'authenticated.storeknox.inventory-details.unscanned-version';

  model() {
    return this.modelFor(this.parentRoute) as SkInventoryAppModel;
  }
}
