import { service } from '@ember/service';
import type Store from 'ember-data/store';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type SkFakeAppModel from 'irene/models/sk-fake-app';

export interface StoreknoxFakeAppDetailsRouteModel {
  fakeApp: SkFakeAppModel;
  skInventoryApp: SkInventoryAppModel;
}

export default class AuthenticatedStoreknoxFakeAppDetailsRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  async model(params: {
    sk_app: string;
    app_id: string;
  }): Promise<StoreknoxFakeAppDetailsRouteModel> {
    const skInventoryApp = await this.store.findRecord(
      'sk-inventory-app',
      params.sk_app
    );

    const fakeApp = await this.store.queryRecord('sk-fake-app', {
      id: params.app_id,
      sk_app_id: skInventoryApp.id,
    });

    return { skInventoryApp, fakeApp };
  }
}
