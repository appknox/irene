import Component from '@glimmer/component';
import type ProjectModel from 'irene/models/project';

export interface OrganizationServiceAccountAddProjectListNameSignature {
  Args: {
    project: ProjectModel;
  };
}

export default class OrganizationServiceAccountAddProjectListNameComponent extends Component<OrganizationServiceAccountAddProjectListNameSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'organization/service-account/add-project/list/name': typeof OrganizationServiceAccountAddProjectListNameComponent;
  }
}
