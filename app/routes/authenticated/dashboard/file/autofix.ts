import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type Store from 'ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type FileModel from 'irene/models/file';
import type ProjectModel from 'irene/models/project';
import type { AutofixHistoryQueryParams } from 'irene/routes/authenticated/dashboard/project/autofix';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export interface FileAutofixModel {
  file: FileModel;
  project: ProjectModel;
  queryParams: {
    autofix_limit: string | number;
    autofix_offset: string | number;
  };
}

export default class AuthenticatedDashboardFileAutofixRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare router: RouterService;
  @service declare store: Store;

  queryParams = {
    autofix_limit: { refreshModel: true },
    autofix_offset: { refreshModel: true },
  };

  async model(params: AutofixHistoryQueryParams): Promise<FileAutofixModel> {
    const { fileid } = this.paramsFor('authenticated.dashboard.file') as {
      fileid: string;
    };
    const file = await this.store.findRecord('file', fileid);

    return {
      file,
      project: await file.project,
      queryParams: {
        autofix_limit: params.autofix_limit ?? '10',
        autofix_offset: params.autofix_offset ?? '0',
      },
    };
  }

  redirect(model: FileAutofixModel) {
    this.router.replaceWith(
      'authenticated.dashboard.project.autofix',
      model.project.id,
      {
        queryParams: {
          file_id: model.file.id,
          autofix_limit: model.queryParams.autofix_limit,
          autofix_offset: model.queryParams.autofix_offset,
        },
      }
    );
  }
}
