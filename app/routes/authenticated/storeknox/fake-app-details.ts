import { service } from '@ember/service';
import type Store from 'ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type SkFakeAppModel from 'irene/models/sk-fake-app';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export interface StoreknoxInventoryDetailsFakeAppDetailsRouteModel {
  fakeApp: SkFakeAppModel;
  skInventoryApp: SkInventoryAppModel;
}

export default class StoreknoxInventoryDetailsFakeAppDetailsRoute extends AkBreadcrumbsRoute {
  @service declare store: Store;

  async model(params: {
    fake_app_id: string;
    sk_app_id: string;
  }): Promise<StoreknoxInventoryDetailsFakeAppDetailsRouteModel> {
    const skInventoryApp = await this.store.findRecord(
      'sk-inventory-app',
      params.sk_app_id
    );

    const fakeApp = await this.store.queryRecord('sk-fake-app', {
      id: params.fake_app_id,
      sk_app_id: skInventoryApp.id,
    });

    return { fakeApp, skInventoryApp };
  }
}
