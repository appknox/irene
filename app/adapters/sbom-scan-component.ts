import commondrf from './commondrf';

export default class SbomScanComponentAdapter extends commondrf {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/sb_files`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  _buildNestedURL(
    modelName: string | number,
    sbomScanId: string | number,
    id?: string | number
  ) {
    const sbomScanUrl = this._buildURL(modelName, sbomScanId);
    const sbomScanComponentUrl = `${sbomScanUrl}/sb_components`;

    if (id) {
      return `${sbomScanComponentUrl}/${encodeURIComponent(id)}`;
    }

    return sbomScanComponentUrl;
  }

  urlForQuery(
    query: { sbomScanId: string | number },
    modelName: string | number
  ) {
    return this._buildNestedURL(modelName, query.sbomScanId);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sbom-scan-component': SbomScanComponentAdapter;
  }
}
