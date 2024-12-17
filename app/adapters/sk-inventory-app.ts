import CommonDRFAdapter from './commondrf';

export default class SkInventoryAppAdapter extends CommonDRFAdapter {
  _buildURL(_: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/sk_app_detail`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-inventory-app': SkInventoryAppAdapter;
  }
}
