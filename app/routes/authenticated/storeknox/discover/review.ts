import Route from '@ember/routing/route';

export interface StoreknoxDiscoveryReviewQueryParam {
  app_limit: string;
  app_offset: string;
}

export default class AuthenticatedStoreknoxDiscoverReviewRoute extends Route {
  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
  };

  model(params: Partial<StoreknoxDiscoveryReviewQueryParam>) {
    const { app_limit = '10', app_offset = '0' } = params;

    return {
      queryParams: { app_limit, app_offset },
    };
  }
}
