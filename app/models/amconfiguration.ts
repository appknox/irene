import Model, { attr } from '@ember-data/model';

export default class AMConfigurationModel extends Model {
  @attr('boolean')
  declare enabled: boolean;

  @attr()
  declare organisation: unknown;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    amconfiguration: AMConfigurationModel;
  }
}
