import Component from '@glimmer/component';
import type ScanParameterGroupModel from 'irene/models/scan-parameter-group';
import type ProjectModel from 'irene/models/project';

export interface ProjectSettingsDastAutomationAutomationScenarioTableStatusSignature {
  Args: {
    project?: ProjectModel;
    scenario: ScanParameterGroupModel;
  };
}

export default class ProjectSettingsDastAutomationAutomationScenarioTableStatusComponent extends Component<ProjectSettingsDastAutomationAutomationScenarioTableStatusSignature> {}
