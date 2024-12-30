import CommondrfNestedAdapter from './commondrf-nested';

export default class DsManualDevicePreferenceAdapter extends CommondrfNestedAdapter {
  _buildURL() {
    return this.buildURLFromBase(
      `${this.namespace}/ds_manual_device_preference`
    );
  }

  setNestedUrlNamespace(profileId: string | number) {
    this.namespace = `${this.namespace_v2}/profiles/${profileId}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'ds-manual-device-preference': DsManualDevicePreferenceAdapter;
  }
}
