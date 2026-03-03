import { service } from '@ember/service';
import type Store from 'ember-data/store';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

interface FakeAppDetailsRouteModel {
  skInventoryApp: SkInventoryAppModel;
}

export default class AuthenticatedStoreknoxFakeAppsFakeAppDetailsRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  async model(params: { id: string }): Promise<FakeAppDetailsRouteModel> {
    const skInventoryApp = await this.store.findRecord(
      'sk-inventory-app',
      params.id
    );
    return { skInventoryApp };
  }
}
