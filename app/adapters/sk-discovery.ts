import commondrf from './commondrf'; // Assuming you're extending a base adapter

export default class SkDiscoveryAdapter extends commondrf {
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
