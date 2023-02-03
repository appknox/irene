import Model, { attr } from '@ember-data/model';

export default class CweModel extends Model {
  @attr('string')
  declare code: string;

  @attr('string')
  declare url: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    cwe: CweModel;
  }
}
