import commondrf from './commondrf';

export default class ClientUploadAdapter extends commondrf {

  urlForQuery(q) {
    const clientId = q.clientId;
    q.clientId = undefined;
    return this.buildURLFromBase(`${this.namespace_v2}/partner/${this.me.partner.id}/clients/${clientId}/file_uploads`);
  }
}
