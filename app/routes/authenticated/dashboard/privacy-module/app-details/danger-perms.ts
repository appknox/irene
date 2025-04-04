import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type MeService from 'irene/services/me';
import type FileModel from 'irene/models/file';

export interface PrivacyModuleDangerPermissionsQueryParam {
  app_limit: number;
  app_offset: number;
}

export interface PrivacyModuleDangerPermsModel {
  file: FileModel;
  queryParams: {
    app_limit: string;
    app_offset: string;
  };
}

export default class AuthenticatedDashboardPrivacyModuleAppDetailsDangerPermRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare me: MeService;
  @service declare router: RouterService;
  @service declare store: Store;

  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
  };

  async model(params: Partial<PrivacyModuleDangerPermissionsQueryParam>) {
    const { app_limit = '10', app_offset = '0' } = params;

    const { app_id } = this.paramsFor(
      'authenticated.dashboard.privacy-module.app-details'
    ) as {
      app_id: string;
    };

    const file = await this.store.findRecord('file', String(app_id));

    return {
      file,
      queryParams: { app_limit, app_offset },
    };
  }
}
