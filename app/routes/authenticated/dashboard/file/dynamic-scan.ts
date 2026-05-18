import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Store from 'ember-data/store';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type OrganizationService from 'irene/services/organization';
import type RouterService from '@ember/routing/router-service';
import type ProjectModel from 'irene/models/project';

export default class AuthenticatedFileDastRoute extends ScrollToTop(Route) {
  @service declare store: Store;
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  get fileId() {
    const { fileid } = this.paramsFor('authenticated.dashboard.file') as {
      fileid: string;
    };

    return fileid;
  }

  beforeModel() {
    if (this.organization.hideUpsellUIStatus.dynamicScanAutomation) {
      this.router.transitionTo(
        'authenticated.dashboard.file.dynamic-scan.manual',
        this.fileId
      );
    }
  }

  async model() {
    const file = await this.store.findRecord('file', this.fileId);

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
