import Model, { attr } from '@ember-data/model';

export default class Nistsp800171Model extends Model {
  @attr('string')
  declare code: string;

  @attr('string')
  declare title: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    nistsp800171: Nistsp800171Model;
  }
}
