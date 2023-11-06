import commondrf from '../commondrf';

export default class PartnerclientAdapter extends commondrf {
  buildURL() {
    return this.buildURLFromBase(`${this.namespace_v2}/partnerclients`);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'partner/partnerclient': PartnerclientAdapter;
  }
}
