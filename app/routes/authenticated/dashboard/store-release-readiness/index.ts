import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type MeService from 'irene/services/me';

export interface StoreReleaseReadinessIndexQueryParam {
  app_limit: string;
  app_offset: string;
  app_query: string;
  app_platform: string;
  app_rejection_risk: string;
}

export default class AuthenticatedDashboardStoreReleaseReadinessIndexRoute extends AkBreadcrumbsRoute {
  @service declare me: MeService;
  @service declare router: RouterService;

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
    app_rejection_risk: {
      refreshModel: true,
    },
  };

  model(params: Partial<StoreReleaseReadinessIndexQueryParam>) {
    const {
      app_limit = '12',
      app_offset = '0',
      app_query = '',
      app_platform = '-1',
      app_rejection_risk = '-1',
    } = params;

    return {
      queryParams: {
        app_limit,
        app_offset,
        app_query,
        app_platform,
        app_rejection_risk,
      },
    };
  }
}
