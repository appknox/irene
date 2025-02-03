import commondrf from './commondrf';

export default class SbomComponentAdapter extends commondrf {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v3}/sb_files`;

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

  _buildDependencyURL(
    modelName: string | number,
    sbomFileId: string | number,
    componentId: string | number
  ) {
    const componentUrl = this._buildNestedURL(
      modelName,
      sbomFileId,
      componentId
    );
    return `${componentUrl}/dependencies`;
  }

  urlForQuery(
    query:
      | { sbomFileId: string | number }
      | {
          type: 1;
          sbomFileId: string | number;
          componentId?: string | number;
        },
    modelName: string | number
  ) {
    if ('type' in query && query.type === 1 && query.componentId) {
      return this._buildDependencyURL(
        modelName,
        query.sbomFileId,
        query.componentId
      );
    }

    return this._buildNestedURL(modelName, query.sbomFileId);
  }

  urlForQueryRecord(query: { sbomComponentId: string | number }) {
    const baseURL = `${this.namespace_v2}/sb_components`; //change this to v3

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
