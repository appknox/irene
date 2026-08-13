import Component from '@glimmer/component';
import { service } from '@ember/service';

import type ProjectModel from 'irene/models/project';
import type OrganizationService from 'irene/services/organization';

interface ProjectSettingsApiScanAutomationSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsApiScanAutomationComponent extends Component<ProjectSettingsApiScanAutomationSignature> {
  @service declare organization: OrganizationService;

  get project() {
    return this.args.project;
  }

  get apiScanFeatureAvailable() {
    return !!this.organization.selected?.features?.apiscan;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::ApiScanAutomation': typeof ProjectSettingsApiScanAutomationComponent;
  }
}
