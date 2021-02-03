import commondrf from './commondrf';

export default class SelfRegisterClientAdapter extends commondrf {

  buildURL() {
    return this.buildURLFromBase(`${this.namespace_v2}/partner/${this.me.partner.id}/self_registered_clients`);
  }

  approve(snapshot, registerId) {
    const modelName = snapshot.constructor.modelName;
    const url = `${this.buildURL(modelName)}/${registerId}/approve`;
    return this.ajax(url, 'PUT', {});
  }
}
