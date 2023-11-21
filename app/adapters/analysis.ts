import commondrf from './commondrf';

interface AnalysisQuery {
  fileId: string | number;
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
    return this._buildNestedURL(modelName, query.fileId);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    analysis: AnalysisAdapter;
  }
}
