import ENV from 'irene/config/environment';
import CommondrfNestedAdapter from './commondrf-nested';

export default class ApiscanAutomationPreferenceAdapter extends CommondrfNestedAdapter {
  _buildURL() {
    return this.buildURLFromBase(
      `${this.namespace}/apiscanautomation_preference`
    );
  }

  setNestedUrlNamespace(profileId: string) {
    this.namespace = `${ENV.namespace}/profiles/${profileId}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'apiscan-automation-preference': ApiscanAutomationPreferenceAdapter;
  }
}
