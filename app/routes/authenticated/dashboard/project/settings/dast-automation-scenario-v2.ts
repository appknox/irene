import { service } from '@ember/service';
import type Store from 'ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type ProjectModel from 'irene/models/project';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';
import type RouterService from '@ember/routing/router-service';

export interface ProjectSettingsDastAutomationScenarioV2QueryParams {
  scenario_id: string;
}

export default class AuthenticatedDashboardProjectSettingsDastAutomationScenarioV2Route extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;
  @service declare me: MeService;
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  get isSuperUser() {
    return this.me.org?.has_security_permission;
  }

  get isAiDastEnabled() {
    return this.organization.selected?.aiFeatures?.ai_dast;
  }

  beforeModel() {
    // Accessible when AI DAST is enabled, or as a super-user sneak-peek while
    // it is disabled. Otherwise fall back to the DAST automation settings.
    if (!this.isAiDastEnabled && !this.isSuperUser) {
      this.router.transitionTo(
        'authenticated.dashboard.project.settings.dast-automation'
      );
    }
  }

  async model({
    scenario_id,
  }: ProjectSettingsDastAutomationScenarioV2QueryParams) {
    const PROJECT_SETTINGS_ROUTE = 'authenticated.dashboard.project.settings';
    const project = this.modelFor(PROJECT_SETTINGS_ROUTE) as ProjectModel;

    const scenarioDetail = await this.store.queryRecord('scenario-detail', {
      id: scenario_id,
      projectId: project.id,
    });

    return { project, scenarioDetail };
  }
}
