import CommonDRFAdapter from './commondrf';

export default class SkDiscoveryAdapter extends CommonDRFAdapter {
  _buildURL() {
    const baseurl = `${this.namespace_v2}/sk_discovery`;

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-discovery': SkDiscoveryAdapter;
  }
}
