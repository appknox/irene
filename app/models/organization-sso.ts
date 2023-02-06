import Model, { attr } from '@ember-data/model';

export default class OrganizationSsoModel extends Model {
  @attr('boolean')
  declare enabled: boolean;

  @attr('boolean')
  declare enforced: boolean;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-sso': OrganizationSsoModel;
  }
}
