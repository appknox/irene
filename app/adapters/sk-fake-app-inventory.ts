import CommonDRFAdapter from './commondrf';

export default class SkFakeAppInventoryAdapter extends CommonDRFAdapter {
  _buildURL() {
    const baseurl = `${this.namespace_v2}/sk_fake_app_inventory`;

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-fake-app-inventory': SkFakeAppInventoryAdapter;
  }
}
