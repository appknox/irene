import commondrf from './commondrf';

export default class SbomScanAdapter extends commondrf {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/sb_files`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  urlForQuery(query: { sbomAppId?: string | number }) {
    const baseURL = this.buildURLFromBase(
      `${this.namespace_v2}/sb_projects/${query.sbomAppId}`
    );

    return `${baseURL}/sb_files`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sbom-scan': SbomScanAdapter;
  }
}
