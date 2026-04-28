import CommonDRFAdapter from './commondrf';

/**
 * List: `GET …/store-release-readiness/scans/` (query: limit, offset, search, …).
 * Detail: `GET …/store-release-readiness/scans/:id/` (embeds `findings` when returned by API).
 */
export default class StoreReleaseReadinessScanAdapter extends CommonDRFAdapter {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/store-release-readiness/scans`;

    if (id !== undefined && id !== null && id !== '') {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}/`);
    }

    return this.buildURLFromBase(`${baseURL}/`);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'store-release-readiness-scan': StoreReleaseReadinessScanAdapter;
  }
}
