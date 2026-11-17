import { inject as service } from '@ember/service';
import type Store from 'ember-data/store';
import type FileModel from 'irene/models/file';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import { resolveFileProject } from 'irene/utils/resolve-file-project';

export default class AuthenticatedFileDastManualDastRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  async model() {
    // The parent dynamic-scan route already loaded the file and its project
    // (same shape); reuse it instead of requesting both again.
    const parentModel = this.modelFor(
      'authenticated.dashboard.file.dynamic-scan'
    ) as { file?: FileModel; profileId?: string | number | null } | undefined;

    if (parentModel?.file) {
      return {
        file: parentModel.file,
        profileId: parentModel.profileId ?? null,
      };
    }

    const { fileid } = this.paramsFor('authenticated.dashboard.file') as {
      fileid: string;
    };

    const file = await this.store.findRecord('file', fileid);
    const project = await resolveFileProject(file, this.store);

    return {
      file,
      profileId: project?.activeProfileId ?? null,
    };
  }
}
