import Component from '@glimmer/component';
import { service } from '@ember/service';

import type ProjectModel from 'irene/models/project';
import type OrganizationService from 'irene/services/organization';

interface ProjectSettingsDastAutomationSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsDastAutomationComponent extends Component<ProjectSettingsDastAutomationSignature> {
  @service declare organization: OrganizationService;

  get project() {
    return this.args.project;
  }

  get dynamicscanAutomationFeatureAvailable() {
    return !!this.organization.selected?.features?.dynamicscan_automation;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation': typeof ProjectSettingsDastAutomationComponent;
  }
}
