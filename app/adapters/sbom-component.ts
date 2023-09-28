import commondrf from './commondrf';

export default class SbomComponentAdapter extends commondrf {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/sb_files`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  _buildNestedURL(
    modelName: string | number,
    sbomFileId: string | number,
    id?: string | number
  ) {
    const sbomFileUrl = this._buildURL(modelName, sbomFileId);
    const sbomComponentUrl = `${sbomFileUrl}/sb_components`;

    if (id) {
      return `${sbomComponentUrl}/${encodeURIComponent(id)}`;
    }

    return sbomComponentUrl;
  }

  urlForQuery(
    query: { sbomFileId: string | number },
    modelName: string | number
  ) {
    return this._buildNestedURL(modelName, query.sbomFileId);
  }

  urlForQueryRecord(query: { sbomComponentId: string | number }) {
    const baseURL = `${this.namespace_v2}/sb_components`;

    return this.buildURLFromBase(
      `${baseURL}/${encodeURIComponent(query.sbomComponentId)}`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sbom-component': SbomComponentAdapter;
  }
}
