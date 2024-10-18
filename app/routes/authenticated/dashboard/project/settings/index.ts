import Route from '@ember/routing/route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type AuthenticatedDashboardProjectSettingsIndexController from 'irene/controllers/authenticated/dashboard/project/settings';
import type ProjectModel from 'irene/models/project';

export default class AuthenticatedDashboardProjectSettingsIndexRoute extends ScrollToTop<ProjectModel>(
  Route
) {
  model() {
    return this.modelFor('authenticated.dashboard.project') as ProjectModel;
  }

  resetController(
    controller: AuthenticatedDashboardProjectSettingsIndexController
  ) {
    // Resets route query params
    controller.set('referrer', '');
    controller.set('file_id', '');
  }
}
