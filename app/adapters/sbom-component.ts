import commondrf from './commondrf';
import ENUMS from 'irene/enums';

export interface SbomAiSummaryResponse {
  total: number;
  by_type: Record<string, number>;
  aibom_supported: boolean;
}

export default class SbomComponentAdapter extends commondrf {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/sb_files`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  _buildNestedURL(
    modelName: string | number,
    sbomFileId: string | number,
    id?: string | number
  ) {
    const sbomFileUrl = this._buildURL(modelName, sbomFileId);
    const sbomComponentUrl = `${sbomFileUrl}/sb_file_components`;

    if (id) {
      return `${sbomComponentUrl}/${encodeURIComponent(id)}`;
    }

    return sbomComponentUrl;
  }

  urlForQuery(
    query: {
      sbomFileId: string | number;
      type?: number;
      componentId?: string | number;
    },
    modelName: string | number
  ) {
    if (query.componentId && query.type) {
      const baseURL = `${this.namespace_v2}/sb_file_component/${encodeURIComponent(query.componentId)}`;
      // Return dependencies URL for type 1
      if (query.type === ENUMS.DEPENDENCY_TYPE.DEPENDENCIES) {
        return this.buildURLFromBase(`${baseURL}/dependencies`);
      }
      // Return parents URL for type 2
      if (query.type === ENUMS.DEPENDENCY_TYPE.PARENTS) {
        return this.buildURLFromBase(`${baseURL}/parents`);
      }
    }

    return this._buildNestedURL(modelName, query.sbomFileId);
  }

  /**
   * Fetches the AI-BOM summary for a given SBOM file — total count,
   * per-type breakdown, and whether AI detection was active for this scan.
   * Returns raw aggregate data, not model records, so this lives on the
   * adapter rather than going through the store.
   */
  getAiSummary(sbomFileId: string | number) {
    const url = `${this._buildNestedURL('sbom-component', sbomFileId)}/ai_summary`;

    return this.ajax(url, 'GET') as Promise<SbomAiSummaryResponse>;
  }

  urlForQueryRecord(query: { sbomComponentId: string | number }) {
    const baseURL = `${this.namespace_v2}/sb_file_component`;

    return this.buildURLFromBase(
      `${baseURL}/${encodeURIComponent(query.sbomComponentId)}`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sbom-component': SbomComponentAdapter;
  }
}
