import commondrf from '../commondrf';

export default class PartnerclientReportAdapter extends commondrf {
  _buildNestedURL(
    _modelName: string | number,
    clientId: string | number | undefined,
    id: string | number | undefined
  ) {
    const baseURL = `${this.namespace_v2}/partnerclients/${clientId}/reports/${id}`;

    return this.buildURLFromBase(baseURL);
  }

  urlForQueryRecord(
    query: {
      clientId: string | number | undefined;
      id: string | number | undefined;
    },
    modelName: string | number
  ) {
    const clientId = query.clientId;
    const id = query.id;

    query.clientId = undefined;
    query.id = undefined;

    return this._buildNestedURL(modelName, clientId, id);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'partner/partnerclient-report': PartnerclientReportAdapter;
  }
}
