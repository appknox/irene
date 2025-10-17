import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Store from '@ember-data/store';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type OrganizationService from 'irene/services/organization';
import type RouterService from '@ember/routing/router-service';

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

    return {
      file,
      profileId: (await file.project)?.activeProfileId,
    };
  }
}
