import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedDashboardFileApiScanRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  async model() {
    const { fileid } = this.paramsFor('authenticated.dashboard.file') as {
      fileid: string;
    };

    return {
      file: await this.store.findRecord('file', fileid),
    };
  }
}
