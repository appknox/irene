import Model, { attr } from '@ember-data/model';

export default class DsManualDevicePreferenceModel extends Model {
  @attr('number')
  declare dsManualDeviceSelection: number;

  @attr('string')
  declare dsManualDeviceSelectionDisplay: string;

  @attr('string')
  declare dsManualDeviceIdentifier: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'ds-manual-device-preference': DsManualDevicePreferenceModel;
  }
}
