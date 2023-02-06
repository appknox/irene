import Model, { attr } from '@ember-data/model';

export default class OrganizationMfaModel extends Model {
  @attr('boolean')
  declare mandate: boolean;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-mfa': OrganizationMfaModel;
  }
}
