import commondrf from './commondrf';
import ENUMS from 'irene/enums';

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
    const sbomComponentUrl = `${sbomFileUrl}/sb_file_components`;

    if (id) {
      return `${sbomComponentUrl}/${encodeURIComponent(id)}`;
    }

    return sbomComponentUrl;
  }

  urlForQuery(
    query: {
      sbomFileId: string | number;
      type?: number;
      componentId?: string | number;
    },
    modelName: string | number
  ) {
    if (query.componentId && query.type) {
      const baseURL = `${this.namespace_v2}/sb_file_component/${encodeURIComponent(query.componentId)}`;
      // Return dependencies URL for type 1
      if (query.type === ENUMS.DEPENDENCY_TYPE.DEPENDENCIES) {
        return this.buildURLFromBase(`${baseURL}/dependencies`);
      }
      // Return parents URL for type 2
      if (query.type === ENUMS.DEPENDENCY_TYPE.PARENTS) {
        return this.buildURLFromBase(`${baseURL}/parents`);
      }
    }

    return this._buildNestedURL(modelName, query.sbomFileId);
  }

  urlForQueryRecord(query: { sbomComponentId: string | number }) {
    const baseURL = `${this.namespace_v2}/sb_file_component`;

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
