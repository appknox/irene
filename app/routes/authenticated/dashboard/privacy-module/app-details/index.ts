import { service } from '@ember/service';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type MeService from 'irene/services/me';
import type FileModel from 'irene/models/file';
import type PrivacyProjectModel from 'irene/models/privacy-project';

export interface PrivacyModuleTrackersQueryParam {
  app_limit: number;
  app_offset: number;
}

export interface PrivacyModuleTrackersModel {
  file: FileModel;
  queryParams: {
    app_limit: string;
    app_offset: string;
  };
}

export default class AuthenticatedDashboardPrivacyModuleAppDetailsIndexRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare me: MeService;

  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
  };

  async model(params: Partial<PrivacyModuleTrackersQueryParam>) {
    const { app_limit = '10', app_offset = '0' } = params;

    const { privacyProject } = this.modelFor(
      'authenticated.dashboard.privacy-module.app-details'
    ) as { privacyProject: PrivacyProjectModel };

    const file = await privacyProject.latestFile;

    return {
      file,
      queryParams: { app_limit, app_offset },
    };
  }
}
