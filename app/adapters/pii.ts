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
    const filesURL = `${this.namespace_v2}/pii_request/${piiExtractionId}/pii_data`;

    return this.buildURLFromBase(filesURL);
  }

  urlForQuery(query: PiiDataQuery, modelName: string | number) {
    const { fileId, piiExtractionId } = query;

    delete query.fileId;
    delete query.piiExtractionId;

    return this._buildNestedURL(modelName, fileId, piiExtractionId);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    pii: PiiAdapter;
  }
}
