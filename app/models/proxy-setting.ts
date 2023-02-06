/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class ProxySettingModel extends Model {
  @attr('boolean')
  declare enabled: boolean;

  @attr('string')
  declare host: string;

  @attr('string')
  declare port: string;

  @computed('host', 'port')
  get hasProxyUrl() {
    return !!this.host && !!this.port;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'proxy-setting': ProxySettingModel;
  }
}
