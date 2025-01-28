import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type DynamicScanService from 'irene/services/dynamic-scan';

export default class AuthenticatedDashboardFileDynamicScanScheduledAutomatedRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;
  @service declare router: RouterService;
  @service('dynamic-scan') declare dsService: DynamicScanService;

  beforeModel(): Promise<unknown> | void {
    if (!this.dsService.showScheduledScan) {
      const { fileid } = this.paramsFor('authenticated.dashboard.file') as {
        fileid: string;
      };

      this.router.transitionTo('authenticated.dashboard.file', fileid);
    }
  }

  async model() {
    const { fileid } = this.paramsFor('authenticated.dashboard.file') as {
      fileid: string;
    };

    const file = await this.store.findRecord('file', fileid);

    return {
      file,
      profileId: (await file.project).activeProfileId,
    };
  }
}
