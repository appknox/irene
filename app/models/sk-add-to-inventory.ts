import Model, { attr } from '@ember-data/model';

export default class SkAddToInventoryModel extends Model {
  @attr('string')
  declare docUlid: string;

  @attr('number')
  declare appDiscoveryQuery: number;

  @attr('number')
  declare approvalStatus: number;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-add-to-inventory': SkAddToInventoryModel;
  }
}
