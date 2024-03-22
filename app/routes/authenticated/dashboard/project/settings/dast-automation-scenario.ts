import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ProjectModel from 'irene/models/project';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import Store from '@ember-data/store';

export interface ProjectSettingsDastAutomationQueryParams {
  scenario_id: string;
}

export default class AuthenticatedDashboardProjectSettingsDastAutomationRoute extends ScrollToTop(
  Route
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
