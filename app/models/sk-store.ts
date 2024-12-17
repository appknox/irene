import Model, { attr } from '@ember-data/model';

export default class SkStoreModel extends Model {
  @attr('string')
  declare icon: string;

  @attr('string')
  declare name: string;

  @attr('string')
  declare identifier: string;

  @attr('string')
  declare platform: number;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-store': SkStoreModel;
  }
}
