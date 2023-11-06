import commondrf from './commondrf';

export default class AvailableDeviceAdapter extends commondrf {}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'available-device': AvailableDeviceAdapter;
  }
}
