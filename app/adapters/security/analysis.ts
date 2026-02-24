import commondrf from '../commondrf';

export default class SecurityAnalysisAdapter extends commondrf {
  _buildURL(modelName: string | number, id: string | number) {
    if (id) {
      return this.buildURLFromBase(`${this.hudson_namespace}/analyses/${id}`);
    } else {
      return this.buildURLFromBase(`${this.hudson_namespace}/analyses`);
    }
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'security/analysis': SecurityAnalysisAdapter;
  }
}
