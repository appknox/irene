import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';

import type ScanParameterGroupModel from 'irene/models/scan-parameter-group';
import type ProjectModel from 'irene/models/project';

export interface ProjectSettingsDastAutomationAutomationScenarioTableSignature {
  Args: {
    project?: ProjectModel | null;
    scenarioList: ScanParameterGroupModel[];
    loadingScenarioList: boolean;
    reloadScenarioList(): void;
  };
}

export default class ProjectSettingsDastAutomationAutomationScenarioTableComponent extends Component<ProjectSettingsDastAutomationAutomationScenarioTableSignature> {
  @service declare router: RouterService;
  @service declare intl: IntlService;

  get columns() {
    return [
      {
        name: this.intl.t('scenario'),
        valuePath: 'name',
        width: 200,
      },
      {
        headerComponent:
          'project-settings/dast-automation/automation-settings/scenario-table/status-header',
        cellComponent:
          'project-settings/dast-automation/automation-settings/scenario-table/status',
        width: 100,
        textAlign: 'right',
      },
    ];
  }

  @action onScenarioClick({
    rowValue: scenario,
  }: {
    rowValue: ScanParameterGroupModel;
  }) {
    this.router.transitionTo(
      'authenticated.dashboard.project.settings.dast-automation-scenario',
      scenario.id
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::AutomationSettings::ScenarioTable': typeof ProjectSettingsDastAutomationAutomationScenarioTableComponent;
  }
}
