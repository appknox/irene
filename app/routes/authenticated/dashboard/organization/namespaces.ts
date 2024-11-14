import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedOrganizationNamespacesRoute extends AkBreadcrumbsRoute {
  queryParams = {
    namespace_limit: {
      refreshModel: true,
    },
    namespace_offset: {
      refreshModel: true,
    },
  };

  model({ namespace_limit = 10, namespace_offset = 0 }) {
    return {
      queryParams: {
        namespaceLimit: Number(namespace_limit),
        namespaceOffset: Number(namespace_offset),
      },
    };
  }
}
