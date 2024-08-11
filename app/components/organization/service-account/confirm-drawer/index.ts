import Component from '@glimmer/component';

export interface OrganizationServiceAccountConfirmDrawerSignature {
  Args: {
    open: boolean;
    onClose: () => void;
    disabled?: boolean;
    confirmText?: string;
    cancelText?: string;
    confirmAction: (closeHandler: () => void) => void;
  };
  Blocks: {
    confirmTitle: [];
  };
}

export default class OrganizationServiceAccountConfirmDrawerComponent extends Component<OrganizationServiceAccountConfirmDrawerSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::ConfirmDrawer': typeof OrganizationServiceAccountConfirmDrawerComponent;
  }
}
