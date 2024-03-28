import Model, { attr } from '@ember-data/model';

export default class OwaspMobile2024Model extends Model {
  @attr('string')
  declare code: string;

  @attr('string')
  declare title: string;

  @attr('string')
  declare year: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    owaspmobile2024: OwaspMobile2024Model;
  }
}
