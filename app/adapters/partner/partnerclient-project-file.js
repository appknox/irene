import commondrf from '../commondrf';

export default class PartnerclientProjectFileAdapter extends commondrf {
  _buildNestedURL(modelName, clientId, projectId) {
    const baseURL = `${this.namespace_v2}/partnerclients/${clientId}/projects/${projectId}/files`;
    return this.buildURLFromBase(baseURL);
  }

  urlForQuery(query, modelName) {
    const clientId = query.clientId;
    const projectId = query.projectId;
    query.clientId = undefined;
    query.projectId = undefined;
    return this._buildNestedURL(modelName, clientId, projectId);
  }
}
