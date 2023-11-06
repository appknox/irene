import commondrf from './commondrf';

export default class CWEAdapter extends commondrf {
  namespace = this.namespace_v2;
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    cwe: CWEAdapter;
  }
}
