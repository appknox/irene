import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export interface SbomAppQueryParam {
  app_limit: string;
  app_offset: string;
  app_query: string;
  app_platform: string;
}

export default class AuthenticatedDashboardSbomAppsRoute extends AkBreadcrumbsRoute {
  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
    app_query: {
      refreshModel: true,
    },
    app_platform: {
      refreshModel: true,
    },
  };

  model(params: Partial<SbomAppQueryParam>) {
    const {
      app_limit = '10',
      app_offset = '0',
      app_query = '',
      app_platform = -1,
    } = params;

    return {
      queryParams: { app_limit, app_offset, app_query, app_platform },
    };
  }
}
