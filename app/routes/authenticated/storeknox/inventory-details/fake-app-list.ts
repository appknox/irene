import { service } from '@ember/service';
import type Store from 'ember-data/store';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export interface StoreknoxInventoryDetailsFakeAppListRouteModel {
  skInventoryApp: SkInventoryAppModel;
  showFakeAppsList: boolean;
}

export default class AuthenticatedStoreknoxInventoryDetailsFakeAppDetailsRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  async model(): Promise<StoreknoxInventoryDetailsFakeAppListRouteModel> {
    const parentParams = this.paramsFor(
      'authenticated.storeknox.inventory-details'
    ) as { id: string };

    const skInventoryApp = await this.store.findRecord(
      'sk-inventory-app',
      parentParams.id
    );

    const showFakeAppsList =
      !skInventoryApp?.fakeAppDetectionIsInitializing &&
      !skInventoryApp?.allFakeAppsCountsAreZero;

    return { skInventoryApp, showFakeAppsList };
  }
}
