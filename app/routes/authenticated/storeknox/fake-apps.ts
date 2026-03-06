import { service } from '@ember/service';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type SkAppsService from 'irene/services/sk-apps';

export interface StoreknoxFakeAppsQueryParams {
  app_limit: number;
  app_offset: number;
  fake_app_detection_enabled: boolean;
}

export default class AuthenticatedStoreknoxFakeAppsRoute extends AkBreadcrumbsRoute {
  @service('sk-apps') declare skAppsService: SkAppsService;

  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
    fake_app_detection_enabled: {
      refreshModel: true,
    },
  };

  async model(params: Partial<StoreknoxFakeAppsQueryParams>) {
    const { app_limit, app_offset, fake_app_detection_enabled } = params;

    this.skAppsService
      .setQueryParams({
        limit: app_limit,
        offset: app_offset,
        fakeAppDetectionEnabled: fake_app_detection_enabled,
      })
      .fetchFakeApps.perform();
  }
}
