import commondrf from '../commondrf';

export default class PartnerclientFileAdapter extends commondrf {
  urlForQuery(q) {
    const clientId = q.clientId;
    const projectId = q.projectId;
    q.clientId = undefined;
    q.projectId = undefined;
    return this.buildURLFromBase(
      `${this.namespace_v2}/partnerclients/${clientId}/projects/${projectId}/files`
    );
  }
}
