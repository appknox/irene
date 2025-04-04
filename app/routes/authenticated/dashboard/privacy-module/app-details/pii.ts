import type FileModel from 'irene/models/file';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedDashboardPrivacyModuleAppDetailsPiiRoute extends AkBreadcrumbsRoute {
  model() {
    return this.modelFor(
      'authenticated.dashboard.privacy-module.app-details'
    ) as FileModel;
  }
}
