import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import Store from '@ember-data/store';

export interface ChooseFilesQueryParams {
  files_limit: string;
  files_offset: string;
  fileid?: string;
}

export default class AuthenticatedChooseRoute extends ScrollToTop(Route) {
  @service declare store: Store;

  queryParams = {
    files_limit: {
      refreshModel: true,
    },
    files_offset: {
      refreshModel: true,
    },
  };

  async model(params: Partial<ChooseFilesQueryParams>) {
    const { files_limit = '10', files_offset = '0', fileid } = params;
    const file = await this.store.findRecord('file', String(fileid));

    return {
      file,
      queryParams: { files_limit, files_offset },
    };
  }
}
