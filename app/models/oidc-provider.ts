import Model, { attr } from '@ember-data/model';

export default class OidcProviderModel extends Model {
  @attr('string')
  declare name: string;

  @attr('boolean')
  declare isActive: boolean;

  @attr('string')
  declare defaultScopes: string;

  @attr('string')
  declare clientId: string;

  @attr('string')
  declare clientSecret: string;

  @attr('string')
  declare discoveryUrl: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'oidc-provider': OidcProviderModel;
  }
}
