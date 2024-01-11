import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedFileIndexRoute extends ScrollToTop(Route) {
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
