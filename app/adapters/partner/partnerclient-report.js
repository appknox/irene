import commondrf from '../commondrf';

export default class PartnerclientReportAdapter extends commondrf {
  _buildNestedURL(_modelName, clientId, id) {
    const baseURL = `${this.namespace_v2}/partnerclients/${clientId}/reports/${id}`;
    return this.buildURLFromBase(baseURL);
  }

  urlForQueryRecord(query, modelName) {
    const clientId = query.clientId;
    const id = query.id;
    query.clientId = undefined;
    query.id = undefined;
    return this._buildNestedURL(modelName, clientId, id);
  }
}
