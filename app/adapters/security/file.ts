/* eslint-disable ember/use-ember-data-rfc-395-imports */
import commondrf from '../commondrf';
import Store from 'ember-data/store';
import { ModelSchema } from 'ember-data';
import ModelRegistry from 'ember-data/types/registries/model';

export default class SecurityFileAdapter extends commondrf {
  namespace = 'api/hudson-api';

  query<K extends keyof ModelRegistry>(
    store: Store,
    type: ModelSchema<K>,
    q: {
      projectId: string | number;
      limit: number;
      offset: number;
    }
  ) {
    const url = this.buildURLFromBase(
      `${this.namespace}/projects/${q.projectId}/files?limit=${q.limit}&offset=${q.offset}`
    );

    return this.ajax(url, 'GET');
  }

  _buildURL(modelName: string | number, id: string | number) {
    if (id) {
      return this.buildURLFromBase(`${this.namespace}/files/${id}`);
    }
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'security/file': SecurityFileAdapter;
  }
}
