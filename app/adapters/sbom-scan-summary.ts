import CommonDRFAdapter from './commondrf';

export default class SbomScanSummaryAdapter extends CommonDRFAdapter {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/sb_projects`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  urlForQueryRecord(
    query: { sbomAppId?: string | number; sbomScanId?: string | number },
    modelName?: string | number
  ) {
    const baseURL = this._buildURL(modelName, query.sbomAppId);

    return `${baseURL}/sb_files/${query.sbomScanId}/summary`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sbom-scan-summary': SbomScanSummaryAdapter;
  }
}
