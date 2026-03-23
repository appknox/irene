import { service } from '@ember/service';
import Route from '@ember/routing/route';
import type SkAppsService from 'irene/services/sk-apps';

export interface StoreknoxFakeAppsIndexQueryParams {
  app_limit: number;
  app_offset: number;
}

export default class AuthenticatedStoreknoxFakeAppsIndexRoute extends Route {
  @service('sk-apps') declare skAppsService: SkAppsService;

  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
  };

  async model(params: Partial<StoreknoxFakeAppsIndexQueryParams>) {
    const { app_limit, app_offset } = params;
    const parentModel = this.modelFor('authenticated.storeknox.fake-apps');

    this.skAppsService
      .setQueryParams({
        limit: app_limit,
        offset: app_offset,
      })
      .fetchFakeApps.perform();

    return parentModel;
  }
}
