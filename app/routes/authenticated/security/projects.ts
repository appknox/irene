import Route from '@ember/routing/route';

export interface SecurityProjectsQueryParam {
  app_limit: string;
  app_offset: string;
  app_query: string;
}

export default class AuthenticatedSecurityProjectsRoute extends Route {
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
  };

  model(params: Partial<SecurityProjectsQueryParam>) {
    const { app_limit = '10', app_offset = '0', app_query = '' } = params;

    return {
      queryParams: { app_limit, app_offset, app_query },
    };
  }
}
