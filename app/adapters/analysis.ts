import commondrf from './commondrf';

export default class AnalysisAdapter extends commondrf {
  _buildURL(modelName: string | number, id: string | number) {
    if (id) {
      const baseurl = `${this.namespace_v2}/analyses`;

      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    analysis: AnalysisAdapter;
  }
}
