import CommondrfNestedAdapter from './commondrf-nested';

export default class DsAutomationPreferenceAdapter extends CommondrfNestedAdapter {
  _buildURL() {
    return this.buildURLFromBase(`${this.namespace}/automation_preference`);
  }

  setNestedUrlNamespace(profileId: string) {
    this.namespace = `${this.namespace_v2}/profiles/${profileId}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'ds-automation-preference': DsAutomationPreferenceAdapter;
  }
}
