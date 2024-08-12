import Component from '@glimmer/component';
import type ServiceAccountModel from 'irene/models/service-account';

export interface OrganizationServiceAccountAddProjectDrawerSignature {
  Args: {
    isCreateView: boolean;
    open: boolean;
    onClose: () => void;
    serviceAccount: ServiceAccountModel;
    refreshSelectedProjects: () => void;
  };
}

export default class OrganizationServiceAccountAddProjectDrawerComponent extends Component<OrganizationServiceAccountAddProjectDrawerSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::AddProject::Drawer': typeof OrganizationServiceAccountAddProjectDrawerComponent;
  }
}
