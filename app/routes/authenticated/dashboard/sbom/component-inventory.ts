import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export interface SbomComponentInventoryQueryParam {
  component_limit: string;
  component_offset: string;
  component_query: string;
  component_type: string;
}

export default class AuthenticatedDashboardSbomComponentInventoryRoute extends AkBreadcrumbsRoute {
  queryParams = {
    component_limit: {
      refreshModel: true,
    },
    component_offset: {
      refreshModel: true,
    },
    component_query: {
      refreshModel: true,
    },
    component_type: {
      refreshModel: true,
    },
  };

  model(params: Partial<SbomComponentInventoryQueryParam>) {
    const {
      component_limit = '10',
      component_offset = '0',
      component_query = '',
      component_type = '',
    } = params;

    return {
      queryParams: {
        component_limit,
        component_offset,
        component_query,
        component_type,
      },
    };
  }
}
