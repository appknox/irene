import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type OrganizationSigningCertificateModel from 'irene/models/organization-signing-certificate';

export interface OrganizationSigningCertificateDeleteConfirmSignature {
  Element: HTMLElement;

  Args: {
    cert: OrganizationSigningCertificateModel;
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  };
}

export default class OrganizationSigningCertificateDeleteConfirmComponent extends Component<OrganizationSigningCertificateDeleteConfirmSignature> {
  @service declare intl: IntlService;

  get certName() {
    return this.args.cert.name || this.intl.t('cyod.signingCert.unnamed');
  }

  get deleteActionBtnDetails() {
    return [
      {
        id: 'confirm',
        label: this.intl.t('yesDelete'),
        loading: this.args.isDeleting,
        action: this.args.onConfirm,
      },
      {
        id: 'cancel',
        variant: 'outlined' as const,
        color: 'neutral' as const,
        label: this.intl.t('cyod.signingCert.deleteNo'),
        action: this.args.onCancel,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::SigningCertificate::DeleteConfirm': typeof OrganizationSigningCertificateDeleteConfirmComponent;
    'organization/signing-certificate/delete-confirm': typeof OrganizationSigningCertificateDeleteConfirmComponent;
  }
}
