import Component from '@glimmer/component';

export interface FileDetailsScanActionsOldManualScanLoginDetailsUserRoleActionSignature {
  Args: {
    onDeleteClick: () => void;
  };
}

export default class FileDetailsScanActionsOldManualScanLoginDetailsUserRoleActionComponent extends Component<FileDetailsScanActionsOldManualScanLoginDetailsUserRoleActionSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/scan-actions-old/manual-scan/login-details/user-role-action': typeof FileDetailsScanActionsOldManualScanLoginDetailsUserRoleActionComponent;
  }
}
