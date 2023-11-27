import Model, { attr } from '@ember-data/model';

export interface CertificateDataType {
  issuer: string;
  issued_on: Date;
  expires_on: Date;
  fingerprint_sha1: string;
  fingerprint_sha256: string;
}

export default class Saml2IdPMetadataModel extends Model {
  @attr('string')
  declare entityId: string;

  @attr('string')
  declare ssoServiceUrl: string;

  @attr('date')
  declare createdOn: Date;

  @attr()
  declare certificate: CertificateDataType;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'saml2-idp-metadata': Saml2IdPMetadataModel;
  }
}
