import Route from '@ember/routing/route';

export interface StoreknoxDiscoveryResultQueryParam {
  app_limit: number;
  app_offset: number;
  app_search_id: string;
  app_query: string;
}

export default class AuthenticatedStoreknoxDiscoverResultRoute extends Route {
  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
    app_search_id: {
      refreshModel: true,
    },
    app_query: {
      refreshModel: true,
    },
  };

  model(params: Partial<StoreknoxDiscoveryResultQueryParam>) {
    const { app_limit, app_offset, app_search_id, app_query } = params;

    return {
      queryParams: { app_limit, app_offset, app_search_id, app_query },
    };
  }
}
