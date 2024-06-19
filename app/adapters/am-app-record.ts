import commondrf from './commondrf';

type AmAppRecordQuery = {
  amAppVersionId?: string | number;
};

export default class AmAppRecordAdapter extends commondrf {
  _buildURL(_: string, id: string | number) {
    const baseurl = `${this.namespace_v2}/am_app_records`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }

  _buildNestedURL(_: string | number, amAppVersionId: string | number) {
    const baseURL = `${this.namespace_v2}/am_app_versions/${amAppVersionId}/am_app_records`;

    return this.buildURLFromBase(baseURL);
  }

  urlForQuery<K extends string | number>(
    query: AmAppRecordQuery,
    modelName: K
  ) {
    if (query.amAppVersionId) {
      const amAppVersionId = query.amAppVersionId;
      delete query.amAppVersionId;

      return this._buildNestedURL(modelName, amAppVersionId);
    }

    return super.urlForQuery(query, modelName);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'am-app-record': AmAppRecordAdapter;
  }
}
