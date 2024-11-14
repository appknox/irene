import ProjectModel from 'irene/models/project';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedDashboardProjectSettingsAnalysisRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  model() {
    return this.modelFor('authenticated.dashboard.project') as ProjectModel;
  }
}
