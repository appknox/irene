import Route from '@ember/routing/route';

export interface StoreknoxDiscoveryReviewQueryParam {
  app_limit: number;
  app_offset: number;
}

export default class AuthenticatedStoreknoxDiscoveryReviewRoute extends Route {
  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
  };

  model(params: Partial<StoreknoxDiscoveryReviewQueryParam>) {
    const { app_limit, app_offset } = params;

    return {
      queryParams: { app_limit, app_offset },
    };
  }
}
