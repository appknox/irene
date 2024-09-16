import commondrf from './commondrf'; // Assuming you're extending a base adapter

export default class SkDiscoveryAdapter extends commondrf {
  urlForQuery(q: { id: string }) {
    const url = `${this.namespace_v2}/sk_discovery/${q.id}/search_results`;

    return this.buildURLFromBase(url);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-discovery-result': SkDiscoveryAdapter;
  }
}
