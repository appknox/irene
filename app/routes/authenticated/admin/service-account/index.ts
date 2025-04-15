import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export interface OrganizationSettingsServiceAccountRouteQueryParams {
  sa_limit: number;
  sa_offset: number;
  show_system_created: boolean;
}

export default class AuthenticatedAdminServiceAccountIndexRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  queryParams = {
    sa_limit: {
      refreshModel: true,
    },
    sa_offset: {
      refreshModel: true,
    },
    show_system_created: {
      refreshModel: true,
    },
  };

  model(
    queryParams: Partial<OrganizationSettingsServiceAccountRouteQueryParams>
  ) {
    return {
      queryParams,
    };
  }
}
