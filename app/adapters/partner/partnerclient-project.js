import commondrf from '../commondrf';

export default class PartnerclientProjectAdapter extends commondrf {
  _buildUrl(endpoint) {
    return this.buildURLFromBase(
      `${this.namespace_v2}/partnerclients${endpoint}`
    );
  }

  urlForQuery(q) {
    const clientId = q.clientId;
    q.clientId = undefined;
    return this._buildUrl(`/${clientId}/projects`);
  }

  urlForQueryRecord(q) {
    const clientId = q.clientId;
    const projectId = q.projectId;
    q.clientId = undefined;
    q.projectId = undefined;
    return this._buildUrl(`/${clientId}/projects/${projectId}`);
  }
}
