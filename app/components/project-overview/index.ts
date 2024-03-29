import Component from '@glimmer/component';
import ProjectModel from 'irene/models/project';

interface ProjectOverviewSignature {
  Element: HTMLElement;
  Args: { project: ProjectModel };
}

export default class ProjectOverviewComponent extends Component<ProjectOverviewSignature> {
  get project() {
    return this.args.project || null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ProjectOverview: typeof ProjectOverviewComponent;
  }
}
