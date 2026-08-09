import { inject as service } from '@ember/service';
import type Store from 'ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import { resolveFileProject } from 'irene/utils/resolve-file-project';

export default class AuthenticatedFileDastManualDastRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  async model() {
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
