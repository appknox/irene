import { inject as service } from '@ember/service';
import type Store from 'ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type ProjectModel from 'irene/models/project';
import type OrganizationService from 'irene/services/organization';
import type RouterService from '@ember/routing/router-service';

export interface ProjectSettingsDastAutomationQueryParams {
  scenario_id: string;
}

export default class AuthenticatedDashboardProjectSettingsDastAutomationRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  get isAiDastEnabled() {
    return this.organization.selected?.aiFeatures?.ai_dast;
  }

  beforeModel() {
    // V1 scan parameter groups are hidden once AI DAST is enabled — the V2
    // scenario flow replaces them.
    if (this.isAiDastEnabled) {
      this.router.transitionTo(
        'authenticated.dashboard.project.settings.dast-automation'
      );
    }
  }

  async model(params: ProjectSettingsDastAutomationQueryParams) {
    const scenario = await this.store.findRecord(
      'scan-parameter-group',
      params?.scenario_id
    );

    return {
      project: this.modelFor('authenticated.dashboard.project') as ProjectModel,
      scenario,
    };
  }
}
