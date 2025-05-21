import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type FileModel from 'irene/models/file';
import type ScanCoverageModel from 'irene/models/scan-coverage';

export type FileDASTResultsModel = {
  file: FileModel;
  scanCoverage: ScanCoverageModel | null;
};

export default class AuthenticatedFileDastDastResultsRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  async model(): Promise<FileDASTResultsModel> {
    const { fileid } = this.paramsFor('authenticated.dashboard.file') as {
      fileid: string;
    };

    const file = await this.store.findRecord('file', fileid);
    let scanCoverage: ScanCoverageModel | null = null;

    // Update coverage info if available.
    // If it remains null, the coverage is not started.
    if (file.screenCoverageSupported) {
      try {
        scanCoverage = await file.getScreenCoverage();
      } catch (error) {
        console.error(error);
      }
    }

    return { file, scanCoverage };
  }
}
