import commondrf from '../commondrf';

export default class PartnerclientFileReportUnlockkeyAdapter extends commondrf {
  _buildNestedURL(_modelName, clientId, reportId) {
    const baseURL = `${this.namespace_v2}/partnerclients/${clientId}/reports/${reportId}/unlock_key`;
    return this.buildURLFromBase(baseURL);
  }

  urlForQueryRecord(query, modelName) {
    const clientId = query.clientId;
    const reportId = query.reportId;
    query.clientId = undefined;
    query.reportId = undefined;
    return this._buildNestedURL(modelName, clientId, reportId);
  }
}
