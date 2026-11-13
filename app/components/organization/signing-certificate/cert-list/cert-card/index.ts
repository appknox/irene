import Component from '@glimmer/component';

import type {
  CertRow,
  CertScope,
} from 'irene/components/organization/signing-certificate';
import type OrganizationSigningCertificateModel from 'irene/models/organization-signing-certificate';

export interface OrganizationSigningCertificateCertListCertCardSignature {
  Element: HTMLElement;

  Args: {
    row: CertRow;
    isActivating: boolean;
    onActivate: (
      cert: OrganizationSigningCertificateModel,
      scope: CertScope
    ) => void;
    onDelete: (
      cert: OrganizationSigningCertificateModel,
      scope: CertScope
    ) => void;
  };
}

export default class OrganizationSigningCertificateCertListCertCardComponent extends Component<OrganizationSigningCertificateCertListCertCardSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::SigningCertificate::CertList::CertCard': typeof OrganizationSigningCertificateCertListCertCardComponent;
    'organization/signing-certificate/cert-list/cert-card': typeof OrganizationSigningCertificateCertListCertCardComponent;
  }
}
