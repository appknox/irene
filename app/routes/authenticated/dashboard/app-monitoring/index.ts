import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type OrganizationService from 'irene/services/organization';
import type AppMonitoringService from 'irene/services/appmonitoring';
import type AMConfigurationModel from 'irene/models/amconfiguration';

interface QueryParams {
  app_limit: number;
  app_offset: number;
  app_query: string;
  app_platform: number;
}

export interface AppMonitoringRouteModel {
  settings: AMConfigurationModel | undefined;
}

export default class AuthenticatedDashboardAppMonitoringIndexRoute extends AkBreadcrumbsRoute {
  @service declare organization: OrganizationService;
  @service declare appmonitoring: AppMonitoringService;
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
  };

  beforeModel() {
    if (!this.organization.selected?.features.app_monitoring) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }

  async model(q: QueryParams): Promise<AppMonitoringRouteModel> {
    const { app_limit, app_offset, app_query, app_platform } = q;

    this.appmonitoring
      .setLimitOffset({
        limit: app_limit,
        offset: app_offset,
        query: app_query,
        platform: app_platform,
      })
      .reload();

    const orgModel = this.organization.selected;
    const AmSettings = await orgModel?.get_am_configuration();

    return {
      settings: AmSettings,
    };
  }
}
