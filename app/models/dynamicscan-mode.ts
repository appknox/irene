import Model, { attr } from '@ember-data/model';

export type DynamicScanModeType = 'Manual' | 'Automated';

export default class DynamicscanModeModel extends Model {
  @attr('string')
  declare dynamicscanMode: DynamicScanModeType;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'dynamicscan-mode': DynamicscanModeModel;
  }
}
