import CommonDRFAdapter from './commondrf';

export type PiiDataQuery = {
  fileId?: string;
  piiExtractionId?: string;
};

export default class PiiAdapter extends CommonDRFAdapter {
  _buildNestedURL(modelName: string | number, piiExtractionId?: string) {
    const piiDataURL = `${this.namespace_v2}/pii_request/${piiExtractionId}/pii_data`;

    return this.buildURLFromBase(piiDataURL);
  }

  urlForQuery(query: PiiDataQuery, modelName: string | number) {
    const { piiExtractionId } = query;

    delete query.piiExtractionId;

    return this._buildNestedURL(modelName, piiExtractionId);
  }

  markPiiTypeSeen(modelName: string, piiId: string, type: string) {
    const baseURL = this._buildNestedURL('pii_data', piiId);

    const url = `${baseURL}/mark_seen`;

    return this.ajax(url, 'POST', {
      contentType: 'application/json',
      data: {
        type,
      },
    }) as Promise<{ success: boolean }>;
  }

  markPrivacySeen(privacyProjectId: string) {
    const seenURL = `${this.namespace_v2}/privacy_project/${privacyProjectId}/mark_seen`;
    const url = this.buildURLFromBase(seenURL);

    return this.ajax(url, 'POST') as Promise<{ success: boolean }>;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    pii: PiiAdapter;
  }
}
