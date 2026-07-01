import Component from '@glimmer/component';

import type ProjectModel from 'irene/models/project';

export interface ProjectSettingsDastAutomationAutomationSettingsSignature {
  Args: {
    project?: ProjectModel | null;
    profileId?: string | number;
    featureAvailable: boolean;
  };
}

export default class ProjectSettingsDastAutomationAutomationSettingsComponent extends Component<ProjectSettingsDastAutomationAutomationSettingsSignature> {
  get profileId() {
    return String(this.args.profileId);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::AutomationSettings': typeof ProjectSettingsDastAutomationAutomationSettingsComponent;
  }
}
