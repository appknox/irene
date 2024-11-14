import { inject as service } from '@ember/service';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type Store from '@ember-data/store';
import type FileModel from 'irene/models/file';

export interface ChooseFilesQueryParams {
  files_limit: string;
  files_offset: string;
  fileid?: string;
}

export interface ChooseFilesModel {
  file: FileModel;
  queryParams: {
    files_limit: string;
    files_offset: string;
  };
}

export default class AuthenticatedDashboardChooseRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
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
