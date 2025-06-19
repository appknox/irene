import { service } from '@ember/service';
import type Store from '@ember-data/store';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type FileModel from 'irene/models/file';
import type IreneAjaxService from 'irene/services/ajax';

export type FileDASTResultsModel = {
  file: FileModel;
};

export default class AuthenticatedFileDastDastResultsRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;
  @service declare ajax: IreneAjaxService;

  async model(): Promise<FileDASTResultsModel> {
    const { fileid } = this.paramsFor('authenticated.dashboard.file') as {
      fileid: string;
    };

    const file = await this.store.findRecord('file', fileid);

    return { file };
  }
}
