import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type MeService from 'irene/services/me';

export interface PrivacyModuleTrackersQueryParam {
  app_limit: number;
  app_offset: number;
}

export default class AuthenticatedDashboardPrivacyModuleAppDetailsIndexRoute extends AkBreadcrumbsRoute {
  @service declare me: MeService;
  @service declare router: RouterService;

  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
  };

  model(params: Partial<PrivacyModuleTrackersQueryParam>) {
    const { app_limit = '10', app_offset = '0' } = params;

    return {
      queryParams: { app_limit, app_offset },
    };
  }
}
