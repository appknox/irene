import commondrf from './commondrf';

export default class APIScanOptionsAdapter extends commondrf {
  urlForQueryRecord(q: { id: string }) {
    const url = `${this.namespace}/profiles/${q.id}/api_scan_options`;

    return this.buildURLFromBase(url);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'api-scan-options': APIScanOptionsAdapter;
  }
}
