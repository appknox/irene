import CommonDRFAdapter from './commondrf';

export type PiiDataQuery = {
  fileId?: string;
  piiExtractionId?: string;
};

export default class PiiAdapter extends CommonDRFAdapter {
  _buildNestedURL(
    modelName: string | number,
    fileId?: string,
    piiExtractionId?: string
  ) {
    const piiDataURL = `${this.namespace_v2}/pii_request/${piiExtractionId}/pii_data`;

    return this.buildURLFromBase(piiDataURL);
  }

  urlForQuery(query: PiiDataQuery, modelName: string | number) {
    const { fileId, piiExtractionId } = query;

    delete query.fileId;
    delete query.piiExtractionId;

    return this._buildNestedURL(modelName, fileId, piiExtractionId);
  }

  markPiiTypeSeen(piiId: string | null, type: string | null) {
    const seenURL = `${this.namespace_v2}/pii_request/${piiId}/pii_data/mark_seen`;

    const url = this.buildURLFromBase(seenURL);

    return this.ajax(url, 'POST', {
      contentType: 'application/json',
      data: {
        type,
      },
    }) as Promise<{ success: boolean }>;
  }

  markPiiSeen(fileId: string | null) {
    const seenURL = `${this.namespace_v2}/privacy_project/mark_pii_scan_seen`;

    const url = this.buildURLFromBase(seenURL);

    return this.ajax(url, 'POST', {
      contentType: 'application/json',
      data: {
        latest_file: fileId,
      },
    }) as Promise<{ success: boolean }>;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    pii: PiiAdapter;
  }
}
