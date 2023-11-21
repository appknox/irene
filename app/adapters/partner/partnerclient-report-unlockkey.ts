import commondrf from '../commondrf';

export default class PartnerclientFileReportUnlockkeyAdapter extends commondrf {
  _buildNestedURL(
    _modelName: string | number,
    clientId: string | number | undefined,
    reportId: string | number | undefined
  ) {
    const baseURL = `${this.namespace_v2}/partnerclients/${clientId}/reports/${reportId}/unlock_key`;

    return this.buildURLFromBase(baseURL);
  }

  urlForQueryRecord(
    query: {
      clientId: string | number | undefined;
      reportId: string | number | undefined;
    },
    modelName: string | number
  ) {
    const clientId = query.clientId;
    const reportId = query.reportId;

    query.clientId = undefined;
    query.reportId = undefined;

    return this._buildNestedURL(modelName, clientId, reportId);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'partner/partnerclient-report-unlockkey': PartnerclientFileReportUnlockkeyAdapter;
  }
}
