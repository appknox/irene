import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type FileModel from 'irene/models/file';

export default class AuthenticatedDashboardFileApiScanResultsRoute extends AkBreadcrumbsRoute {
  model() {
    return this.modelFor('authenticated.dashboard.file.api-scan') as {
      file: FileModel;
    };
  }
}
