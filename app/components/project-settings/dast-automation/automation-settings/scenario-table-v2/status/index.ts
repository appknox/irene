import Component from '@glimmer/component';
import type ProjectModel from 'irene/models/project';
import type ScenarioModel from 'irene/models/scenario';

export interface ProjectSettingsDastAutomationAutomationScenarioTableV2StatusSignature {
  Args: {
    project?: ProjectModel;
    scenario: ScenarioModel;
  };
}

export default class ProjectSettingsDastAutomationAutomationScenarioTableV2StatusComponent extends Component<ProjectSettingsDastAutomationAutomationScenarioTableV2StatusSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'project-settings/dast-automation/automation-settings/scenario-table-v2/status': typeof ProjectSettingsDastAutomationAutomationScenarioTableV2StatusComponent;
  }
}
