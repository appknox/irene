import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type { StoreknoxInventoryDetailsFakeAppListRouteModel } from '../fake-app-list';

export default class AuthenticatedStoreknoxInventoryDetailsFakeAppListFakeAppRoute extends AkBreadcrumbsRoute {
  model() {
    return this.modelFor(
      'authenticated.storeknox.inventory-details.fake-app-list'
    ) as StoreknoxInventoryDetailsFakeAppListRouteModel;
  }
}
