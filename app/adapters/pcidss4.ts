import CommonDRFAdapter from './commondrf';

export default class Pcidss4Adapter extends CommonDRFAdapter {
  namespace = this.namespace_v2;
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    pcidss4: Pcidss4Adapter;
  }
}
