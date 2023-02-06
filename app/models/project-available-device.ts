import Model, { attr } from '@ember-data/model';

export default class ProjectAvailableDeviceModel extends Model {
  @attr('boolean')
  declare isTablet: boolean;

  @attr('string')
  declare platformVersion: string;

  @attr('number')
  declare platform: number;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'project-available-device': ProjectAvailableDeviceModel;
  }
}
