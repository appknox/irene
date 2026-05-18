import { inject as service } from '@ember/service';
import type Store from 'ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type ProjectModel from 'irene/models/project';

export default class AuthenticatedFileDastManualDastRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  async model() {
    const { fileid } = this.paramsFor('authenticated.dashboard.file') as {
      fileid: string;
    };

    const file = await this.store.findRecord('file', fileid);

    // Use belongsTo().id() + store.findRecord to avoid getBelongsTo proxy side effects during render
    let project = file.belongsTo('project').value() as ProjectModel | null;
    if (!project) {
      const projectId = file.belongsTo('project').id();
      if (projectId) {
        project = (await this.store.findRecord('project', projectId)) as ProjectModel;
      }
    }

    return {
      file,
      profileId: project?.activeProfileId ?? null,
    };
  }
}
