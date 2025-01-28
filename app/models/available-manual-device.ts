import DeviceModel from './device';

export default class AvailableManualDeviceModel extends DeviceModel {}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'available-manual-device': AvailableManualDeviceModel;
  }
}
