import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';

import type ScenarioModel from 'irene/models/scenario';
import type ProjectModel from 'irene/models/project';

export interface ProjectSettingsDastAutomationAutomationScenarioTableV2Signature {
  Args: {
    project?: ProjectModel | null;
    scenarioList: ScenarioModel[];
    loadingScenarioList: boolean;
    reloadScenarioList(): void;
  };
}

export default class ProjectSettingsDastAutomationAutomationScenarioTableV2Component extends Component<ProjectSettingsDastAutomationAutomationScenarioTableV2Signature> {
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
          'project-settings/dast-automation/automation-settings/scenario-table-v2/status',
        width: 50,
        textAlign: 'center',
      },
      {
        name: this.intl.t('action'),
        cellComponent:
          'project-settings/dast-automation/automation-settings/scenario-table-v2/actions',
        width: 50,
        textAlign: 'center',
      },
    ];
  }

  @action onScenarioClick({ rowValue: scenario }: { rowValue: ScenarioModel }) {
    this.router.transitionTo(
      'authenticated.dashboard.project.settings.dast-automation-scenario-v2',
      scenario.id
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::AutomationSettings::ScenarioTableV2': typeof ProjectSettingsDastAutomationAutomationScenarioTableV2Component;
  }
}
