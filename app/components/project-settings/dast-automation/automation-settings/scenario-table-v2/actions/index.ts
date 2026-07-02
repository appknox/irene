import Component from '@glimmer/component';

import type ProjectModel from 'irene/models/project';
import type ScenarioModel from 'irene/models/scenario';

export interface ProjectSettingsDastAutomationAutomationScenarioTableV2ActionsSignature {
  Args: {
    project?: ProjectModel | null;
    scenario: ScenarioModel;
    reloadScenarioList?: () => void;
  };
}

export default class ProjectSettingsDastAutomationAutomationScenarioTableV2ActionsComponent extends Component<ProjectSettingsDastAutomationAutomationScenarioTableV2ActionsSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'project-settings/dast-automation/automation-settings/scenario-table-v2/actions': typeof ProjectSettingsDastAutomationAutomationScenarioTableV2ActionsComponent;
  }
}
