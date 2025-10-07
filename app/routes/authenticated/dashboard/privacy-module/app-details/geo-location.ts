import { service } from '@ember/service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type MeService from 'irene/services/me';
import type PrivacyProjectModel from 'irene/models/privacy-project';

export default class AuthenticatedDashboardPrivacyModuleAppDetailsPiiRoute extends ScrollToTop(
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

  async model() {
    const { privacyProject } = this.modelFor(
      'authenticated.dashboard.privacy-module.app-details'
    ) as { privacyProject: PrivacyProjectModel };

    const file = await privacyProject.latestFile;

    return {
      file,
    };
  }
}
