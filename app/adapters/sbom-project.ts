import CommonDRFAdapter from './commondrf';

export default class SbomProjectAdapter extends CommonDRFAdapter {
  _buildURL(modelName: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/sb_projects`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sbom-project': SbomProjectAdapter;
  }
}
