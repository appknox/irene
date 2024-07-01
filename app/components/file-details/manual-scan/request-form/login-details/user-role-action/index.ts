import Component from '@glimmer/component';

export interface FileDetailsManualScanRequestFormLoginDetailsUserRoleActionSignature {
  Args: {
    onDeleteClick: () => void;
  };
}

export default class FileDetailsManualScanRequestFormLoginDetailsUserRoleActionComponent extends Component<FileDetailsManualScanRequestFormLoginDetailsUserRoleActionSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/manual-scan/request-form/login-details/user-role-action': typeof FileDetailsManualScanRequestFormLoginDetailsUserRoleActionComponent;
  }
}
