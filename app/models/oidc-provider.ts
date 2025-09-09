import Model, { attr } from '@ember-data/model';

export default class OidcProviderModel extends Model {
  @attr('string')
  declare username: string;

  @attr()
  declare scopesSupported: string[];

  @attr('boolean')
  declare enabled: boolean;

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
