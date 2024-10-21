import CommonDRFAdapter from './commondrf';

export type SkAppQuery = {
  sk_app_id: string | number;
  app_status: string | number;
  approval_status: string | number;
};

export default class SkAppAdapter extends CommonDRFAdapter {
  _buildURL(_: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/sk_app_detail`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  urlForQuery<K extends string | number>(
    query: Partial<SkAppQuery>,
    modelName: K
  ) {
    if (query.sk_app_id) {
      const skAppId = query.sk_app_id;
      delete query.sk_app_id;

      return this._buildURL(modelName, skAppId);
    }

    const queryURL = `${this.namespace_v2}/sk_app`;

    return this.buildURLFromBase(queryURL);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-app': SkAppAdapter;
  }
}
