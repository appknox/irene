import CommonDRFAdapter from './commondrf';

export interface SbomScanDownloadReportDetails {
  url: string;
}

export default class SbomAppAdapter extends CommonDRFAdapter {
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
    'sbom-app': SbomAppAdapter;
  }
}
