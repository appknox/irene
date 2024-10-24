import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';

import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedDashboardFileManualScanRoute extends ScrollToTop(
  Route
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
