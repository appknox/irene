import Model, { attr } from '@ember-data/model';

export default class DynamicscanModeModel extends Model {
  @attr('string')
  declare dynamicscanMode: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'dynamicscan-mode': DynamicscanModeModel;
  }
}
