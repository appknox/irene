import Component from '@glimmer/component';
import type ServiceAccountModel from 'irene/models/service-account';

export interface AdminServiceAccountAddProjectDrawerSignature {
  Args: {
    isCreateView: boolean;
    open: boolean;
    onClose: () => void;
    serviceAccount: ServiceAccountModel;
    refreshSelectedProjects: () => void;
  };
}

export default class AdminServiceAccountAddProjectDrawerComponent extends Component<AdminServiceAccountAddProjectDrawerSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::ServiceAccount::AddProject::Drawer': typeof AdminServiceAccountAddProjectDrawerComponent;
  }
}
