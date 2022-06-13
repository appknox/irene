import commondrf from '../commondrf';

export default class PartnerclientFileReportAdapter extends commondrf {
  _buildNestedURL(modelName, clientId, fileId) {
    const baseURL = `${this.namespace_v2}/partnerclients/${clientId}/files/${fileId}/reports`;
    return this.buildURLFromBase(baseURL);
  }

  urlForQuery(query, modelName) {
    const clientId = query.clientId;
    const fileId = query.fileId;
    query.clientId = undefined;
    query.fileId = undefined;
    return this._buildNestedURL(modelName, clientId, fileId);
  }
}
