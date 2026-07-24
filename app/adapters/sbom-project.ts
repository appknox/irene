import CommonDRFAdapter from './commondrf';

export default class SbomProjectAdapter extends CommonDRFAdapter {
  _buildURL(modelName: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/sb_projects`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  urlForQuery(query: { sbomComponentId?: string | number }) {
    // Drill-down: apps whose latest SBOM contains the given component.
    if (query.sbomComponentId) {
      const baseURL = this.buildURLFromBase(
        `${this.namespace_v2}/sb_components/${query.sbomComponentId}`
      );

      return `${baseURL}/sb_projects`;
    }

    return this._buildURL('sbom-project');
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sbom-project': SbomProjectAdapter;
  }
}
