import CommondrfNestedAdapter from './commondrf-nested';

export default class ScanCoverageScreenAdapter extends CommondrfNestedAdapter {
  _buildURL() {
    return this.buildURLFromBase(`${this.namespace}/app_screens`);
  }

  setNestedUrlNamespace(fileId: string) {
    this.namespace = `${this.namespace_v2}/files/${fileId}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'scan-coverage-screen': ScanCoverageScreenAdapter;
  }
}
