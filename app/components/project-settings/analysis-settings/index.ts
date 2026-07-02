import Component from '@glimmer/component';
import { service } from '@ember/service';

import type ProjectModel from 'irene/models/project';
import type OrganizationService from 'irene/services/organization';

interface ProjectSettingsAnalysisSettingsSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsAnalysisSettingsComponent extends Component<ProjectSettingsAnalysisSettingsSignature> {
  @service declare organization: OrganizationService;

  get project() {
    return this.args.project;
  }

  get isKnoxIqEnabled() {
    return this.organization.isKnoxIqEnabled;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::AnalysisSettings': typeof ProjectSettingsAnalysisSettingsComponent;
  }
}
