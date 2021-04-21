import commondrf from './commondrf';

export default class ClientInviteAdapter extends commondrf {

  buildURL() {
    return this.buildURLFromBase(`${this.namespace_v2}/partner/${this.me.partner.id}/invite`);
  }

  resendInvitation(snapshot, inviteId) {
    const modelName = snapshot.constructor.modelName;
    const url = `${this.buildURL(modelName)}/${inviteId}/resend_invitation`;
    return this.ajax(url, 'PUT', {});
  }
}
