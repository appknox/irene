import commondrf from './commondrf';

interface AnalysisQuery {
  fileId: string | number;
  limit?: number;
}

export default class AnalysisAdapter extends commondrf {
  _buildURL(modelName: string | number, id: string | number) {
    if (id) {
      const baseurl = `${this.namespace_v2}/analyses`;

      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
  }

  _buildNestedURL(modelName: string | number, fileId: string | number) {
    const baseURL = `${this.namespace_v2}/files/${fileId}/analyses`;

    return this.buildURLFromBase(baseURL);
  }

  urlForQuery(query: AnalysisQuery, modelName: string | number) {
    // TODO: Remove magic number 300 when UI is updated to use pagination
    const DEFAULT_LIMIT = 200;
    const { fileId, limit = DEFAULT_LIMIT } = query;
    const url = this._buildNestedURL(modelName, fileId);

    return `${url}?limit=${limit}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    analysis: AnalysisAdapter;
  }
}
