import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type FileModel from 'irene/models/file';
import type PrivacyProjectModel from 'irene/models/privacy-project';

export interface PrivacyModulePiiModel {
  file: FileModel;
}

export default class AuthenticatedDashboardPrivacyModuleAppDetailsPiiRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
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
