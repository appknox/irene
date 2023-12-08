import Component from '@glimmer/component';
import ProjectModel from 'irene/models/project';

export interface ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsSignature {
  Args: {
    project?: ProjectModel | null;
    profileId?: string | number;
  };
}

export default class ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsComponent extends Component<ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::DynamicscanAutomationSettings': typeof ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsComponent;
  }
}
