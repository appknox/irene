import commondrf from './commondrf';

export type SkAppVersionQuery = {
  skAppId?: string | number;
  is_latest?: boolean;
};

export default class SkAppVersionAdapter extends commondrf {
  _buildURL(_: string, id: string | number) {
    const baseurl = `${this.namespace_v2}/sk_app_version`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }

  _buildNestedURL(_: string | number, skAppId: string | number) {
    const baseURL = `${this.namespace_v2}/sk_app/${skAppId}/sk_app_version`;

    return this.buildURLFromBase(baseURL);
  }

  urlForQuery<K extends string | number>(
    query: SkAppVersionQuery,
    modelName: K
  ) {
    if (query.skAppId) {
      const skAppId = query.skAppId;

      delete query.skAppId;

      return this._buildNestedURL(modelName, skAppId);
    }

    return super.urlForQuery(query, modelName);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-app-version': SkAppVersionAdapter;
  }
}
