import CommonDRFAdapter from './commondrf';

export default class SkThirdPartyAppAdapter extends CommonDRFAdapter {
  _buildURL() {
    const baseurl = `${this.namespace_v2}/sk_third_party_apps`;

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-third-party-app': SkThirdPartyAppAdapter;
  }
}
