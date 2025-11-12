import commondrf from './commondrf';

interface AnalysisOwaspQuery {
  fileId: string | number;
  limit?: number;
}

export default class AnalysisOwaspAdapter extends commondrf {
  _buildNestedURL(_modelName: string | number, fileId: string | number) {
    const baseURL = `${this.namespace_v3}/files/${fileId}/analyses/owasp`;

    return this.buildURLFromBase(baseURL);
  }

  urlForQuery(query: AnalysisOwaspQuery, modelName: string | number) {
    // TODO: Remove magic number 200 when UI is updated to use pagination
    const DEFAULT_LIMIT = 200;
    const { fileId, limit = DEFAULT_LIMIT } = query;
    const url = this._buildNestedURL(modelName, fileId);

    return `${url}?limit=${limit}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'analysis-owasp': AnalysisOwaspAdapter;
  }
}
