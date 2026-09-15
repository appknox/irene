import Component from '@glimmer/component';

export interface OrganizationSigningCertificateCertListSkeletonLoaderSignature {
  Element: HTMLDivElement;
}

export default class OrganizationSigningCertificateCertListSkeletonLoaderComponent extends Component<OrganizationSigningCertificateCertListSkeletonLoaderSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::SigningCertificate::CertList::SkeletonLoader': typeof OrganizationSigningCertificateCertListSkeletonLoaderComponent;
    'organization/signing-certificate/cert-list/skeleton-loader': typeof OrganizationSigningCertificateCertListSkeletonLoaderComponent;
  }
}
