import Model, { attr } from '@ember-data/model';

export default class Nistsp80053Model extends Model {
  @attr('string')
  declare code: string;

  @attr('string')
  declare title: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    nistsp80053: Nistsp80053Model;
  }
}
