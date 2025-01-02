import Model, { attr } from '@ember-data/model';

export default class DsAutomatedDevicePreferenceModel extends Model {
  @attr('number')
  declare dsAutomatedDeviceSelection: number;

  @attr('string')
  declare dsAutomatedDeviceSelectionDisplay: string;

  @attr('number')
  declare dsAutomatedDeviceType: number;

  @attr('string')
  declare dsAutomatedPlatformVersionMin: string;

  @attr('string')
  declare dsAutomatedPlatformVersionMax: string;

  @attr('string')
  declare dsAutomatedDeviceIdentifier: string;

  @attr('boolean', { allowNull: true })
  declare dsAutomatedUseReservedDevice: boolean | null;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'ds-automated-device-preference': DsAutomatedDevicePreferenceModel;
  }
}
