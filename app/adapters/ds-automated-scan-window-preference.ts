import CommondrfNestedAdapter from './commondrf-nested';

export default class DsAutomatedScanWindowPreferenceAdapter extends CommondrfNestedAdapter {
  _buildURL() {
    return this.buildURLFromBase(
      `${this.namespace}/ds_automated_scan_window_preference`
    );
  }

  setNestedUrlNamespace(profileId: string) {
    this.namespace = `${this.namespace_v2}/profiles/${profileId}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'ds-automated-scan-window-preference': DsAutomatedScanWindowPreferenceAdapter;
  }
}
