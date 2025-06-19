import type FileModel from 'irene/models/file';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedDashboardFileManualScanResultsRoute extends AkBreadcrumbsRoute {
  model() {
    return this.modelFor('authenticated.dashboard.file.manual-scan') as {
      file: FileModel;
    };
  }
}
