import Component from '@glimmer/component';
import ProjectModel from 'irene/models/project';

export interface ProjectListAppNameSignature {
  Args: {
    project: ProjectModel;
  };
}

export default class ProjectListAppNameComponent extends Component<ProjectListAppNameSignature> {
  get packageName() {
    return this.args.project.get('packageName');
  }

  get name() {
    return this.args.project.get('lastFile')?.get('name');
  }

  get iconUrl() {
    return this.args.project.get('lastFile')?.get('iconUrl');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectList::AppName': typeof ProjectListAppNameComponent;
    'project-list/app-name': typeof ProjectListAppNameComponent;
  }
}
