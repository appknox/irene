import commondrf from './commondrf';

export interface SbomComponentExportResponse {
  id: number;
  status: number;
  download_url: string | null;
}

export default class SbomComponentInventoryAdapter extends commondrf {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/sb_components`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  _exportBaseURL(componentId: string | number) {
    return this.buildURLFromBase(
      `${this.namespace_v2}/sb_components/${encodeURIComponent(
        componentId
      )}/export`
    );
  }

  createExport(
    componentId: string | number,
    history = false
  ): Promise<SbomComponentExportResponse> {
    const url = this._exportBaseURL(componentId);

    // Same ?history=true convention as the apps drill-down listing.
    return this.ajax(history ? `${url}?history=true` : url, 'POST', {
      headers: this.headers,
    });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sbom-component-inventory': SbomComponentInventoryAdapter;
  }
}
