import Component from '@glimmer/component';

export interface FileDetailsScanActionsManualScanLoginDetailsUserRoleActionSignature {
  Args: {
    onDeleteClick: () => void;
  };
}

export default class FileDetailsScanActionsManualScanLoginDetailsUserRoleActionComponent extends Component<FileDetailsScanActionsManualScanLoginDetailsUserRoleActionSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/scan-actions/manual-scan/login-details/user-role-action': typeof FileDetailsScanActionsManualScanLoginDetailsUserRoleActionComponent;
  }
}
