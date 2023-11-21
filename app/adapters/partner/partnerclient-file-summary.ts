import commondrf from '../commondrf';

export default class PartnerclientFileSummaryAdapter extends commondrf {
  _buildNestedURL(
    _modelName: string | number,
    clientId: string | number | undefined,
    fileId: string | number | undefined
  ) {
    const baseURL = `${this.namespace_v2}/partnerclients/${clientId}/files/${fileId}/summary`;

    return this.buildURLFromBase(baseURL);
  }

  urlForQueryRecord(
    query: {
      clientId: string | number | undefined;
      fileId: string | number | undefined;
    },
    modelName: string | number
  ) {
    const clientId = query.clientId;
    const fileId = query.fileId;

    query.clientId = undefined;
    query.fileId = undefined;

    return this._buildNestedURL(modelName, clientId, fileId);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'partner/partnerclient-file-summary': PartnerclientFileSummaryAdapter;
  }
}
