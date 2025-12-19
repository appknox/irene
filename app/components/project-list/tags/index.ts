import Component from '@glimmer/component';
import ProjectModel from 'irene/models/project';

interface ProjectListTagsSignature {
  Element: HTMLElement;
  Args: {
    project: ProjectModel;
  };
}

export default class ProjectListTagsComponent extends Component<ProjectListTagsSignature> {
  get file() {
    return this.args.project.get('lastFile');
  }

  get tags() {
    return this.file?.get('tags') || [];
  }

  get hasTags() {
    return (this.tags.length as number) > 0;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectList::Tags': typeof ProjectListTagsComponent;
  }
}
