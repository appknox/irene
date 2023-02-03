import Model, { attr } from '@ember-data/model';

export default class TagModel extends Model {
  @attr('string')
  declare name: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    tag: TagModel;
  }
}
