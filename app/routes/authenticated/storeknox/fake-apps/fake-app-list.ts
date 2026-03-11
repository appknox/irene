import { service } from '@ember/service';
import type Store from 'ember-data/store';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export interface StoreknoxFakeAppListRouteModel {
  skInventoryApp: SkInventoryAppModel;
  showFakeAppsList: boolean;
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

    const showFakeAppsList =
      !skInventoryApp?.fakeAppDetectionIsInitializing &&
      !skInventoryApp?.allFakeAppsCountsAreZero;

    return { skInventoryApp, showFakeAppsList };
  }
}
