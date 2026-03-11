import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type { StoreknoxFakeAppListRouteModel } from 'irene/routes/authenticated/storeknox/fake-apps/fake-app-list';

export default class AuthenticatedStoreknoxFakeAppListIndexRoute extends AkBreadcrumbsRoute {
  model() {
    return this.modelFor(
      'authenticated.storeknox.fake-apps.fake-app-list'
    ) as StoreknoxFakeAppListRouteModel;
  }
}
