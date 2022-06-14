import commondrf from '../commondrf';

export default class PartnerclientFileSummaryAdapter extends commondrf {
  _buildNestedURL(modelName, clientId, fileId) {
    const baseURL = `${this.namespace_v2}/partnerclients/${clientId}/files/${fileId}/summary`;
    return this.buildURLFromBase(baseURL);
  }

  urlForQueryRecord(query, modelName) {
    const clientId = query.clientId;
    const fileId = query.fileId;
    query.clientId = undefined;
    query.fileId = undefined;
    return this._buildNestedURL(modelName, clientId, fileId);
  }
}
