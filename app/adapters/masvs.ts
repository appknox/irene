import CommonDRFAdapter from './commondrf';

export default class MasvsAdapter extends CommonDRFAdapter {
  _buildURL(modelName: string | number, id: string | number) {
    const baseurl = `${this.namespace_v2}/masvses`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    masvs: MasvsAdapter;
  }
}
