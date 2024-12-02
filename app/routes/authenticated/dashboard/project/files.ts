import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type ProjectModel from 'irene/models/project';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export interface ProjectFilesQueryParams {
  files_limit: string;
  files_offset: string;
}

export interface ProjectFilesModel {
  project: ProjectModel;
  queryParams: {
    files_limit: string;
    files_offset: string;
  };
}

export default class AuthenticatedDashboardProjectFilesRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  queryParams = {
    files_limit: {
      refreshModel: true,
    },
    files_offset: {
      refreshModel: true,
    },
  };

  model(params: Partial<ProjectFilesQueryParams>): ProjectFilesModel {
    const { files_limit = '10', files_offset = '0' } = params;

    const project = this.modelFor(
      'authenticated.dashboard.project'
    ) as ProjectModel;

    return { project, queryParams: { files_limit, files_offset } };
  }
}
