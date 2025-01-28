import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type ConfigurationService from 'irene/services/configuration';

import type ProjectModel from 'irene/models/project';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedDashboardProjectSettingsDastAutomationRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare router: RouterService;
  @service declare configuration: ConfigurationService;

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
  }

  beforeModel() {
    if (this.orgIsAnEnterprise) {
      this.router.transitionTo(
        'authenticated.dashboard.project.settings.index'
      );
    }
  }

  model() {
    return this.modelFor('authenticated.dashboard.project') as ProjectModel;
  }
}
