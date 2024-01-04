import CommonDRFAdapter from './commondrf';

export default class Nistsp80053Adapter extends CommonDRFAdapter {
  namespace = this.namespace_v2;
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    nistsp80053: Nistsp80053Adapter;
  }
}
