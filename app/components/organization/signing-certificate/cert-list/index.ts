import Component from '@glimmer/component';

import type { CertRow } from 'irene/components/organization/signing-certificate';
import type OrganizationSigningCertificateModel from 'irene/models/organization-signing-certificate';

export interface OrganizationSigningCertificateCertListSignature {
  Element: HTMLElement;

  Args: {
    certs: CertRow[];
    isLoading: boolean;
    isActivating: boolean;
    isProjectScope: boolean;
    onActivate: (cert: OrganizationSigningCertificateModel) => void;
    onDelete: (cert: OrganizationSigningCertificateModel) => void;
  };
}

export default class OrganizationSigningCertificateCertListComponent extends Component<OrganizationSigningCertificateCertListSignature> {
  get hasCerts() {
    return this.args.certs.length > 0;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::SigningCertificate::CertList': typeof OrganizationSigningCertificateCertListComponent;
    'organization/signing-certificate/cert-list': typeof OrganizationSigningCertificateCertListComponent;
  }
}
