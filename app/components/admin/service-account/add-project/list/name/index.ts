import Component from '@glimmer/component';
import type ProjectModel from 'irene/models/project';

export interface AdminServiceAccountAddProjectListNameSignature {
  Args: {
    project: ProjectModel;
  };
}

export default class AdminServiceAccountAddProjectListNameComponent extends Component<AdminServiceAccountAddProjectListNameSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'admin/service-account/add-project/list/name': typeof AdminServiceAccountAddProjectListNameComponent;
  }
}
