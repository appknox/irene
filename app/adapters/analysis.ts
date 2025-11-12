import commondrf from './commondrf';

export default class AnalysisAdapter extends commondrf {
  _buildURL(modelName: string | number, id: string | number) {
    if (id) {
      const baseurl = `${this.namespace_v2}/analyses`;

      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
  }

  _buildNestedURL(modelName: string | number, fileId: string | number) {
    const baseURL = `${this.namespace_v3}/files/${fileId}/analyses`;

    return this.buildURLFromBase(baseURL);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    analysis: AnalysisAdapter;
  }
}
