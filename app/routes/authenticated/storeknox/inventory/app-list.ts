import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export interface StoreknoxInventoryAppListQueryParams {
  app_limit: number;
  app_offset: number;
}

export default class AuthenticatedStoreknoxInventoryAppListRoute extends AkBreadcrumbsRoute {
  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
  };

  model(params: Partial<StoreknoxInventoryAppListQueryParams>) {
    const { app_limit, app_offset } = params;

    return {
      queryParams: { app_limit, app_offset },
    };
  }
}
