/* eslint-disable ember/no-computed-properties-in-native-classes */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Model, { attr } from '@ember-data/model';
import { Service as IntlService } from 'ember-intl';

export default class DevicePreferenceModel extends Model {
  @service declare intl: IntlService;

  @attr('number')
  declare deviceType: number;

  @attr('string')
  declare platformVersion: string;

  get tAnyVersion() {
    return this.intl.t('anyVersion');
  }

  @computed('platformVersion', 'tAnyVersion')
  get versionText() {
    if (this.platformVersion === '0') {
      return this.tAnyVersion;
    } else {
      return this.platformVersion;
    }
  }

  @computed('platformVersion')
  get isAnyVersion() {
    return this.platformVersion !== '0';
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'device-preference': DevicePreferenceModel;
  }
}
