import CommonDRFAdapter from './commondrf';

export default class OffsecFindingAdapter extends CommonDRFAdapter {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/offsec/findings`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  /** Findings for one scan, used by the scan-results page. */
  urlForQuery(query: { scanId?: string }) {
    const { scanId } = query;

    delete query.scanId;

    return this.buildURLFromBase(
      `${this.namespace_v2}/offsec/scans/${scanId}/findings`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'offsec-finding': OffsecFindingAdapter;
  }
}
