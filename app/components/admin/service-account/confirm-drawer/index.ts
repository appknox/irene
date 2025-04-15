import Component from '@glimmer/component';

export interface AdminServiceAccountConfirmDrawerSignature {
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

export default class AdminServiceAccountConfirmDrawerComponent extends Component<AdminServiceAccountConfirmDrawerSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::ServiceAccount::ConfirmDrawer': typeof AdminServiceAccountConfirmDrawerComponent;
  }
}
