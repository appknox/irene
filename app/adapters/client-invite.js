import commondrf from './commondrf';

export default class ClientInviteAdapter extends commondrf {

  buildURL() {
    console.log('partnerId', this)
    return this.buildURLFromBase(`${this.namespace_v2}/partner/${this.me.partner.id}/invite`);
  }

  resendInvitation(snapshot, inviteId) {
    console.log('inviteId', inviteId)
    const modelName = snapshot.constructor.modelName;
    const url = `${this.buildURL(modelName)}/${inviteId}/resend_invitation`;
    return this.ajax(url, 'PUT', {});
  }
}
