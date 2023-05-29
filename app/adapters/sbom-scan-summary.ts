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
    query: { sbomProjectId?: string | number; sbomFileId?: string | number },
    modelName?: string | number
  ) {
    const baseURL = this._buildURL(modelName, query.sbomProjectId);

    return `${baseURL}/sb_files/${query.sbomFileId}/summary`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sbom-scan-summary': SbomScanSummaryAdapter;
  }
}
