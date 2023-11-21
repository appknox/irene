import commondrf from '../commondrf';

export default class SecurityAnalysisAdapter extends commondrf {
  namespace = 'api/hudson-api';

  _buildURL(modelName: string | number, id: string | number) {
    if (id) {
      return this.buildURLFromBase(`${this.namespace}/analyses/${id}`);
    } else {
      return this.buildURLFromBase(`${this.namespace}/analyses`);
    }
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'security/analysis': SecurityAnalysisAdapter;
  }
}
