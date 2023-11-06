import commondrf from './commondrf';

export default class MfaAdapter extends commondrf {
  _buildURL() {
    const baseURL = `${this.namespace}/v2/mfa`;

    return this.buildURLFromBase(baseURL);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    mfa: MfaAdapter;
  }
}
