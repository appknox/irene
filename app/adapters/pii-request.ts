import CommondrfNestedAdapter from './commondrf-nested';

export default class PiiRequestAdapter extends CommondrfNestedAdapter {
  _buildURL() {
    return this.buildURLFromBase(`${this.namespace}/pii_request`);
  }

  setNestedUrlNamespace(fileId: string) {
    this.namespace = `${this.namespace_v2}/files/${fileId}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'pii-request': PiiRequestAdapter;
  }
}
