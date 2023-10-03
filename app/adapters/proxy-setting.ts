import commondrf from './commondrf';

export default class ProxySettingAdapter extends commondrf {
  buildURL(modelName?: string | number, id?: string | number) {
    return this.buildURLFromBase(
      `${this.namespace}/profiles/${id}/proxy_settings`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'proxy-setting': ProxySettingAdapter;
  }
}
