import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';

export default class AuthenticatedFileIndexRoute extends Route {
  @service declare store: Store;

  activate() {
    window.scrollTo(0, 0);
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
