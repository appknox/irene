import Route from '@ember/routing/route';

export interface SecurityFilesQueryParam {
  app_limit: string;
  app_offset: string;
}

interface RouteParams extends Partial<SecurityFilesQueryParam> {
  projectid: string;
}

export default class AuthenticatedSecurityFilesRoute extends Route {
  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
  };

  model(params: RouteParams) {
    const { app_limit = '10', app_offset = '0', projectid } = params;

    return {
      projectid: projectid,
      queryParams: { app_limit, app_offset },
    };
  }
}
