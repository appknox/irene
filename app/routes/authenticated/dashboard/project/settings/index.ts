import Route from '@ember/routing/route';
import ProjectModel from 'irene/models/project';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedDashboardProjectSettingsIndexRoute extends ScrollToTop<ProjectModel>(
  Route
) {
  model() {
    return this.modelFor('authenticated.dashboard.project') as ProjectModel;
  }
}
