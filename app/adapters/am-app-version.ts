import commondrf from './commondrf';

type AmAppVersionQuery = {
  amAppId?: string | number;
  latestVersions?: boolean;
};

export default class AmAppVersionAdapter extends commondrf {
  _buildURL(modelName: string, id: string | number) {
    const baseurl = `${this.namespace_v2}/am_app_versions`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }

  _buildNestedURL(modelName: string | number, amAppId: string | number) {
    const baseURL = `${this.namespace_v2}/am_apps/${amAppId}/am_app_versions`;

    return this.buildURLFromBase(baseURL);
  }

  buildAmAppLatestVersionsURL(amAppId: string | number) {
    const amAppAdapter = this.store.adapterFor('am-app');

    return amAppAdapter._buildURL('am-app', amAppId) + '/latest_versions';
  }

  urlForQuery<K extends string | number>(
    query: AmAppVersionQuery,
    modelName: K
  ) {
    if (query.amAppId) {
      const amAppId = query.amAppId;

      if (query.latestVersions) {
        delete query.latestVersions;
        delete query.amAppId;

        return this.buildAmAppLatestVersionsURL(amAppId);
      }

      delete query.amAppId;

      return this._buildNestedURL(modelName, amAppId);
    }

    return super.urlForQuery(query, modelName);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'am-app-version': AmAppVersionAdapter;
  }
}
