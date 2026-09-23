import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type ProjectModel from 'irene/models/project';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export interface AutofixHistoryQueryParams {
  autofix_limit?: string | number;
  autofix_offset?: string | number;
  file_id?: string | number;
}

export interface ProjectAutofixModel {
  project: ProjectModel;
  queryParams: {
    autofix_limit: string | number;
    autofix_offset: string | number;
    file_id?: string | number;
  };
}

export default class AuthenticatedDashboardProjectAutofixRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  queryParams = {
    autofix_limit: { refreshModel: true },
    autofix_offset: { refreshModel: true },
    file_id: { refreshModel: true },
  };

  model(params: AutofixHistoryQueryParams): ProjectAutofixModel {
    const project = this.modelFor(
      'authenticated.dashboard.project'
    ) as ProjectModel;

    return {
      project,
      queryParams: {
        autofix_limit: params.autofix_limit ?? '10',
        autofix_offset: params.autofix_offset ?? '0',
        file_id: params.file_id,
      },
    };
  }
}
