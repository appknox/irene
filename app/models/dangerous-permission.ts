import Model, { attr } from '@ember-data/model';

export default class DangerousPermissionModel extends Model {
  @attr('string')
  declare permissionName: string;

  @attr('string')
  declare category: string;

  @attr('date')
  declare createdAt: Date;

  @attr('date')
  declare updatedAt: Date;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'dangerous-permission': DangerousPermissionModel;
  }
}
