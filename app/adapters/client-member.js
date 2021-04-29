import commondrf from './commondrf';

export default class ClientMemberAdapter extends commondrf {

  urlForQuery(q) {
    const clientId = q.clientId;
    q.clientId = undefined;
    return this.buildURLFromBase(`${this.namespace_v2}/partner/${this.me.partner.id}/clients/${clientId}/members`);
  }
}
