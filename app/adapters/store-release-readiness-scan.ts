import CommonDRFAdapter from './commondrf';

export default class StoreReleaseReadinessScanAdapter extends CommonDRFAdapter {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/store-release-readiness/scans`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(`${baseURL}`);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'store-release-readiness-scan': StoreReleaseReadinessScanAdapter;
  }
}
