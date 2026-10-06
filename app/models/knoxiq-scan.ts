import Model, { attr } from '@ember-data/model';

export default class KnoxiqScanModel extends Model {
  @attr('number')
  declare sastStatus: number;

  @attr('number')
  declare dastStatus: number;

  @attr('number')
  declare apiStatus: number;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'knoxiq-scan': KnoxiqScanModel;
  }
}
