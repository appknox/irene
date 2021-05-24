import commondrf from './commondrf';

export default class RegistrationRequestAdapter extends commondrf {

  buildURL(modelName, id) {
    return this.buildURLFromBase(`${this.namespace_v2}/registration_requests${id ? '/' + id : ''}`);
  }

  async patch(id, modelName, snapshot, data) {
    const url = this.buildURL(modelName, id);
    await this.ajax(url, 'PATCH', {data});
    return this.store.findRecord(modelName, id);
  }

  async resend(id, modelName, snapshot) {
    const url = `${this.buildURL(modelName, id)}/resend`;
    return this.ajax(url, 'POST', {});
  }
}
