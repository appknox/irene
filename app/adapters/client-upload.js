import commondrf from './commondrf';

export default class ClientAdapter extends commondrf {
  urlForQuery(q) {
    const clientId = q.clientId;
    q.clientId = undefined;
    return this.buildURLFromBase(`${this.namespace_v2}/partners/${this.organization.selected.id}/clients/${clientId}/file_uploads`);
  }
}
