import Component from '@glimmer/component';
import ProjectModel from 'irene/models/project';

interface ProjectSettingsAnalysisSettingsSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsAnalysisSettingsComponent extends Component<ProjectSettingsAnalysisSettingsSignature> {
  get project() {
    return this.args.project;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::AnalysisSettings': typeof ProjectSettingsAnalysisSettingsComponent;
  }
}
