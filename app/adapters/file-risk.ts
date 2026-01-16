import CommonDRFAdapter from './commondrf';

type FileRiskQueryParams = {
  limit?: number;
  offset?: number;
  q?: string;
  platform?: number;
  sorting?: string;
  team?: string;
  package_name?: string;
  is_active?: boolean;
};

export default class FileRiskAdapter extends CommonDRFAdapter {
  _buildURL(_: string | number, id?: string | number) {
    if (id) {
      const baseurl = `${this.namespace_v3}/files`;

      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}/risk`);
    }

    const baseurl = `${this.namespace_v3}/risk`;

    return this.buildURLFromBase(baseurl);
  }

  urlForQuery(query: FileRiskQueryParams, modelName: string | number): string {
    return this._buildURL(modelName);
  }

  urlForQueryRecord(id: string | number, modelName: string | number) {
    return this._buildURL(modelName, id);
  }

  urlForFindRecord(id: string | number) {
    return this._buildURL('file-risk', id);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'file-risk': FileRiskAdapter;
  }
}
