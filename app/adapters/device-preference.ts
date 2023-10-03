import commondrf from './commondrf';

export default class DevicePreference extends commondrf {
  urlForQueryRecord(q: { id: string }) {
    const url = `${this.namespace}/profiles/${q.id}/device_preference`;
    return this.buildURLFromBase(url);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'device-preference': DevicePreference;
  }
}
