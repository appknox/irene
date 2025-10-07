import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type ProjectModel from 'irene/models/project';
import type ConfigurationService from 'irene/services/configuration';
import type OrganizationService from 'irene/services/organization';

export default class AuthenticatedDashboardProjectSettingsDastAutomationRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare router: RouterService;
  @service declare configuration: ConfigurationService;
  @service declare organization: OrganizationService;

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
  }

  beforeModel() {
    if (
      this.orgIsAnEnterprise ||
      this.organization.hideUpsellUIStatus.dynamicScanAutomation
    ) {
      const params = this.paramsFor('authenticated.dashboard.project');

      this.router.transitionTo(
        'authenticated.dashboard.project.settings.index',
        (params as { projectid: string }).projectid
      );
    }
  }

  model() {
    return this.modelFor('authenticated.dashboard.project') as ProjectModel;
  }
}
