import Component from '@glimmer/component';
import ProjectModel from 'irene/models/project';

interface ProjectAnalysisSettingsSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectAnalysisSettingsComponent extends Component<ProjectAnalysisSettingsSignature> {
  constructor(owner: unknown, args: ProjectAnalysisSettingsSignature['Args']) {
    super(owner, args);
  }

  get project() {
    return this.args.project;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ProjectAnalysisSettings: typeof ProjectAnalysisSettingsComponent;
    'project-analysis-settings': typeof ProjectAnalysisSettingsComponent;
  }
}
