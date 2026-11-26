import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type FileModel from 'irene/models/file';

export default class AuthenticatedDashboardFileApiScanEndpointRoute extends AkBreadcrumbsRoute {
  model(params: { url_id: string }) {
    const { file } = this.modelFor('authenticated.dashboard.file.api-scan') as {
      file: FileModel;
    };

    return { file, urlId: params.url_id };
  }
}
