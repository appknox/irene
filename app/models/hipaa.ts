import Model, { attr } from '@ember-data/model';

export default class HipaaModel extends Model {
  @attr('string')
  declare code: string;

  @attr
  declare safeguard: unknown;

  @attr('string')
  declare title: string;

  @attr
  declare standards: unknown;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    hipaa: HipaaModel;
  }
}
