import Route from '@ember/routing/route';
import type FileModel from 'irene/models/file';

export default class AuthenticatedDashboardFileApiScanResultsRoute extends Route {
  model() {
    return this.modelFor('authenticated.dashboard.file.api-scan') as {
      file: FileModel;
    };
  }
}
