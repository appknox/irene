import Component from '@glimmer/component';
import ScanParameterGroupModel from 'irene/models/scan-parameter-group';
import ProjectModel from 'irene/models/project';

export interface ProjectSettingsGeneralSettingsDynamicscanAutomationScenarioTableStatusSignature {
  Args: {
    project?: ProjectModel;
    scenario: ScanParameterGroupModel;
  };
}

export default class ProjectSettingsGeneralSettingsDynamicscanAutomationScenarioTableStatusComponent extends Component<ProjectSettingsGeneralSettingsDynamicscanAutomationScenarioTableStatusSignature> {}
