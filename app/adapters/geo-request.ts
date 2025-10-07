import CommondrfNestedAdapter from './commondrf-nested';

export type GeoRequestQuery = {
  fileId?: string;
};

export default class GeoRequestAdapter extends CommondrfNestedAdapter {
  _buildURL() {
    return this.buildURLFromBase(`${this.namespace}/geo_request`);
  }

  setNestedUrlNamespace(fileId: string) {
    this.namespace = `${this.namespace_v2}/files/${fileId}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'geo-request': GeoRequestAdapter;
  }
}
