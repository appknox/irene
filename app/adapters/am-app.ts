import commondrf from './commondrf';

export default class AmAppAdapter extends commondrf {
  _buildURL(modelName: string | number, id: string | number) {
    const baseurl = `${this.namespace_v2}/am_apps`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'am-app': AmAppAdapter;
  }
}
