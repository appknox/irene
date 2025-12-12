import Component from '@glimmer/component';

import type ProjectModel from 'irene/models/project';

export interface ProjectListPlatformSignature {
  Element: HTMLElement;
  Args: {
    project: ProjectModel;
  };
}

export default class ProjectListPlatformComponent extends Component<ProjectListPlatformSignature> {
  get platformIconClass() {
    return this.args.project.get('platformIconClass');
  }

  get platformIconName() {
    return this.platformIconClass === 'apple' ? 'fa-brands:apple' : 'android';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectList::AppPlatform': typeof ProjectListPlatformComponent;
    'project-list/app-platform': typeof ProjectListPlatformComponent;
  }
}
