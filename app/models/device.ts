import Model, { attr } from '@ember-data/model';

export default class DeviceModel extends Model {
  @attr('boolean')
  declare isTablet: boolean;

  @attr('string')
  declare version: string;

  @attr('number')
  declare platform: number;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    device: DeviceModel;
  }
}
