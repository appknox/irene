import CommonDRFAdapter from './commondrf';

export default class SkAddToInventoryAdapter extends CommonDRFAdapter {
  _buildURL() {
    const baseurl = `${this.namespace_v2}/sk_app`;

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-add-to-inventory': SkAddToInventoryAdapter;
  }
}
