import Route from '@ember/routing/route';
import ProjectModel from 'irene/models/project';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export interface ProjectFilesQueryParams {
  files_limit: string;
  files_offset: string;
}

export default class AuthenticatedProjectFilesRoute extends ScrollToTop(Route) {
  queryParams = {
    files_limit: {
      refreshModel: true,
    },
    files_offset: {
      refreshModel: true,
    },
  };

  model(params: Partial<ProjectFilesQueryParams>) {
    const { files_limit = '10', files_offset = '0' } = params;

    const project = this.modelFor('authenticated.project') as ProjectModel;

    return { project, queryParams: { files_limit, files_offset } };
  }
}
