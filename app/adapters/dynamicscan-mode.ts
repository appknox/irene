import commondrf from './commondrf';

export default class DynamicscanModeAdapter extends commondrf {
  urlForQueryRecord(q: { id: string }) {
    const url = `${this.namespace}/profiles/${q.id}/dynamicscan_mode`;

    return this.buildURLFromBase(url);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'dynamicscan-mode': DynamicscanModeAdapter;
  }
}
