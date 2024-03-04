import CommonDRFAdapter from './commondrf';

export default class OwaspMobile2024Adapter extends CommonDRFAdapter {
  namespace = this.namespace_v2;
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    owaspmobile2024: OwaspMobile2024Adapter;
  }
}
