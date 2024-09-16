import CommonDRFAdapter from './commondrf';

export default class SkDiscoveryResultAdapter extends CommonDRFAdapter {
  urlForQuery(q: { id: string }) {
    const url = `${this.namespace_v2}/sk_discovery/${q.id}/search_results`;

    return this.buildURLFromBase(url);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-discovery-result': SkDiscoveryResultAdapter;
  }
}
