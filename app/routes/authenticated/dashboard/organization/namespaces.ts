import Route from '@ember/routing/route';

export default class AuthenticatedOrganizationNamespacesRoute extends Route {
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
