import Route from '@ember/routing/route';
import type FileModel from 'irene/models/file';

export default class AuthenticatedDashboardFileManualScanResultsRoute extends Route {
  model() {
    return this.modelFor('authenticated.dashboard.file.manual-scan') as {
      file: FileModel;
    };
  }
}
