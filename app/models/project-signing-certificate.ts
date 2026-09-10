import OrganizationSigningCertificateModel from './organization-signing-certificate';

export default class ProjectSigningCertificateModel extends OrganizationSigningCertificateModel {}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'project-signing-certificate': ProjectSigningCertificateModel;
  }
}
