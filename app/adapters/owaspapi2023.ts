import CommonDRFAdapter from './commondrf';

export default class OwaspApi2023Adapter extends CommonDRFAdapter {
  namespace = this.namespace_v2;
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    owaspapi2023: OwaspApi2023Adapter;
  }
}
