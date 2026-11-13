import Component from '@glimmer/component';

export interface OrganizationSigningCertificateUploadFormOverrideConfirmSignature {
  Element: HTMLDivElement;

  Args: {
    isUploading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  };
}

export default class OrganizationSigningCertificateUploadFormOverrideConfirmComponent extends Component<OrganizationSigningCertificateUploadFormOverrideConfirmSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::SigningCertificate::UploadForm::OverrideConfirm': typeof OrganizationSigningCertificateUploadFormOverrideConfirmComponent;
    'organization/signing-certificate/upload-form/override-confirm': typeof OrganizationSigningCertificateUploadFormOverrideConfirmComponent;
  }
}
