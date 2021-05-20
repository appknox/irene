import commondrf from './commondrf';

export default class RegistrationRequestAdapter extends commondrf {

  buildURL(modelName, id) {
    return this.buildURLFromBase(`${this.namespace_v2}/registration_requests${id ? '/' + id : ''}`);
  }

  updateStatus(store, type, snapshot, data) {
    let id = snapshot.id;
    const url = this.buildURL(type.modelName, id);
    return this.ajax(url, 'PATCH', {
      data
    });
  }

  resend(store, type, snapshot) {
    let id = snapshot.id;
    const url = `${this.buildURL(type.modelName, id)}/resend`;
    return this.ajax(url, 'POST', {});
  }
}
