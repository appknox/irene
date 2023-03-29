import commondrf from './commondrf';

type AmAppRecordQuery = {
  amAppId?: string | number;
};

export default class AmAppRecordAdapter extends commondrf {
  _buildURL(_: string, id: string | number) {
    const baseurl = `${this.namespace_v2}/am_app_records`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }

  _buildNestedURL(_: string | number, amAppId: string | number) {
    const baseURL = `${this.namespace_v2}/am_apps/${amAppId}/am_app_records`;

    return this.buildURLFromBase(baseURL);
  }

  urlForQuery<K extends string | number>(
    query: AmAppRecordQuery,
    modelName: K
  ) {
    if (query.amAppId) {
      const amAppId = query.amAppId;
      delete query.amAppId;

      return this._buildNestedURL(modelName, amAppId);
    }

    return super.urlForQuery(query, modelName);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'am-app-record': AmAppRecordAdapter;
  }
}
