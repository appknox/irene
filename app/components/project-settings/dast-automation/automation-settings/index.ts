import { service } from '@ember/service';
import Component from '@glimmer/component';

import type ProjectModel from 'irene/models/project';
import type MeService from 'irene/services/me';

export interface ProjectSettingsDastAutomationAutomationSettingsSignature {
  Args: {
    project?: ProjectModel | null;
    profileId?: string | number;
    featureAvailable: boolean;
  };
}

export default class ProjectSettingsDastAutomationAutomationSettingsComponent extends Component<ProjectSettingsDastAutomationAutomationSettingsSignature> {
  @service declare me: MeService;

  get isSuperUser() {
    return this.me.org?.has_security_permission;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::AutomationSettings': typeof ProjectSettingsDastAutomationAutomationSettingsComponent;
  }
}
