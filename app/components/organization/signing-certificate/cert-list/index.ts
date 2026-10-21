import Component from '@glimmer/component';

import type { CertRow } from 'irene/components/organization/signing-certificate';
import type OrganizationSigningCertificateModel from 'irene/models/organization-signing-certificate';

export interface OrganizationSigningCertificateCertListSignature {
  Element: HTMLElement;

  Args: {
    projectCerts: CertRow[];
    orgCerts: CertRow[];
    isLoading: boolean;
    isActivating: boolean;
    isProjectScope: boolean;
    onActivate: (
      cert: OrganizationSigningCertificateModel,
      scope: CertRow['scope']
    ) => void;
    onDelete: (
      cert: OrganizationSigningCertificateModel,
      scope: CertRow['scope']
    ) => void;
  };
}

export default class OrganizationSigningCertificateCertListComponent extends Component<OrganizationSigningCertificateCertListSignature> {
  get hasCerts() {
    return this.args.projectCerts.length + this.args.orgCerts.length > 0;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::SigningCertificate::CertList': typeof OrganizationSigningCertificateCertListComponent;
    'organization/signing-certificate/cert-list': typeof OrganizationSigningCertificateCertListComponent;
  }
}
