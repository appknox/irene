import Model, { attr } from '@ember-data/model';

export default class PcidssModel extends Model {
  @attr('string')
  declare code: string;

  @attr('string')
  declare title: string;

  @attr('string')
  declare description: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    pcidss: PcidssModel;
  }
}
