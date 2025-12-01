import AnalysisAdapter from './analysis';

interface AnalysisQuery {
  fileId: string | number;
  limit?: number;
}

export default class AnalysisOverviewAdapter extends AnalysisAdapter {
  _buildNestedURL(_modelName: string | number, fileId: string | number) {
    const baseURL = `${this.namespace_v3}/files/${fileId}/analyses`;

    return this.buildURLFromBase(baseURL);
  }

  urlForQuery(query: AnalysisQuery, modelName: string | number) {
    // TODO: Remove magic number 200 when UI is updated to use pagination
    const DEFAULT_LIMIT = 200;
    const { fileId, limit = DEFAULT_LIMIT } = query;
    const url = this._buildNestedURL(modelName, fileId);

    return `${url}?limit=${limit}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'analysis-overview': AnalysisOverviewAdapter;
  }
}
