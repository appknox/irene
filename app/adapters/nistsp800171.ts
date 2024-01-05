import CommonDRFAdapter from './commondrf';

export default class Nistsp800171Adapter extends CommonDRFAdapter {
  namespace = this.namespace_v2;
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    nistsp800171: Nistsp800171Adapter;
  }
}
