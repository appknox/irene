import commondrf from './commondrf';
import type { InitiateUploadResponse } from './sk-app';

export type SkAppVersionQuery = {
  sk_app_id?: string | number;
  is_latest?: boolean;
};

export default class SkAppVersionAdapter extends commondrf {
  _buildURL(_: string, id: string | number) {
    const baseurl = `${this.namespace_v2}/sk_app_versions`;

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
    if (query.sk_app_id) {
      const skAppId = query.sk_app_id;

      delete query.sk_app_id;

      return this._buildNestedURL(modelName, skAppId);
    }

    return super.urlForQuery(query, modelName);
  }

  async initiateAppUpload(id: string) {
    const url = this.buildURL().concat(`/${id}/sk_initiate_upload`);

    return (await this.ajax(url, 'POST')) as InitiateUploadResponse;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-app-version': SkAppVersionAdapter;
  }
}
