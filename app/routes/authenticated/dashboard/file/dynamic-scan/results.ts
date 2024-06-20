import Route from '@ember/routing/route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import Store from '@ember-data/store';
import { inject as service } from '@ember/service';

export default class AuthenticatedFileDastDastResultsRoute extends ScrollToTop(
  Route
) {
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
