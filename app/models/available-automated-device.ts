import DeviceModel from './device';

export default class AvailableAutomatedDeviceModel extends DeviceModel {}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'available-automated-device': AvailableAutomatedDeviceModel;
  }
}
