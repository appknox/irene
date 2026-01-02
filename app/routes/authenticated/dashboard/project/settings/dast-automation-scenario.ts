import { inject as service } from '@ember/service';
import type Store from 'ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type ProjectModel from 'irene/models/project';

export interface ProjectSettingsDastAutomationQueryParams {
  scenario_id: string;
}

export default class AuthenticatedDashboardProjectSettingsDastAutomationRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

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
