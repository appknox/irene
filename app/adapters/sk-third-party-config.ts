import CommonDRFAdapter from './commondrf';

export default class SkThirdPartyConfigAdapter extends CommonDRFAdapter {
  _buildURL() {
    return this.buildURLFromBase(`${this.namespace_v2}/sk_third_party_config`);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-third-party-config': SkThirdPartyConfigAdapter;
  }
}
