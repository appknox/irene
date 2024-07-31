import CommonDRFAdapter from './commondrf';

export default class SamaAdapter extends CommonDRFAdapter {
  namespace = this.namespace_v2;
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    sama: SamaAdapter;
  }
}
