import Model, { attr } from '@ember-data/model';

export default class EucraModel extends Model {
  @attr('string')
  declare code: string;

  @attr('string')
  declare title: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    eucra: EucraModel;
  }
}
