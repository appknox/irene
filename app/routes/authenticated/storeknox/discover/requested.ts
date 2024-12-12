import Route from '@ember/routing/route';

export interface StoreknoxDiscoveryRequestedQueryParam {
  app_limit: number;
  app_offset: number;
}

export default class AuthenticatedStoreknoxDiscoverRequestedRoute extends Route {
  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
  };

  model(params: Partial<StoreknoxDiscoveryRequestedQueryParam>) {
    const { app_limit, app_offset } = params;

    return {
      queryParams: { app_limit, app_offset },
    };
  }
}
