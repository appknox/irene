import Route from '@ember/routing/route';
import type Store from '@ember-data/store';
import { inject as service } from '@ember/service';

import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedFileDastRoute extends ScrollToTop(Route) {
  @service declare store: Store;

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
