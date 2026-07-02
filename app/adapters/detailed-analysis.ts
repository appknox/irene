import CommondrfNestedAdapter from './commondrf-nested';

export default class DetailedAnalysisAdapter extends CommondrfNestedAdapter {
  _buildURL() {
    return this.buildURLFromBase(`${this.namespace}/detailed-analysis`);
  }

  setNestedUrlNamespace(id: string) {
    this.namespace = `${this.namespace_v2}/analyses/${id}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'detailed-analysis': DetailedAnalysisAdapter;
  }
}
