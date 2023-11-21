import commondrf from './commondrf';

export default class ASVSAdapter extends commondrf {
  namespace = this.namespace_v2;
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    asvs: ASVSAdapter;
  }
}
