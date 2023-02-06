import Model, { attr } from '@ember-data/model';

export default class CapturedApiModel extends Model {
  @attr('boolean')
  declare isActive: boolean;

  @attr
  declare request: unknown;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    capturedapi: CapturedApiModel;
  }
}
