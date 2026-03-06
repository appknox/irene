import { service } from '@ember/service';
import type Store from 'ember-data/store';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class StoreknoxFakeAppsDetailsRoute extends AkBreadcrumbsRoute {
  @service declare store: Store;

  async model(params: { sk_app_id: string; id: string }) {
    return await this.store.queryRecord('sk-fake-app', {
      sk_app_id: params.sk_app_id,
      id: params.id,
    });
  }
}
