import Model, { attr } from '@ember-data/model';

export default class OrganizationUserModel extends Model {
  @attr('string')
  declare username: string;

  @attr('string')
  declare email: string;

  @attr('boolean')
  declare isActive: boolean;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-user': OrganizationUserModel;
  }
}
