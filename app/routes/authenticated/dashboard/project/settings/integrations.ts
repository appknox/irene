import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type ProjectModel from 'irene/models/project';

export default class AuthenticatedDashboardProjectSettingsIntegrationsRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  model() {
    return this.modelFor('authenticated.dashboard.project') as ProjectModel;
  }
}
