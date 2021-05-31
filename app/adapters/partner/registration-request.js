import commondrf from '../commondrf';

export default class RegistrationRequestAdapter extends commondrf {
  buildURL(modelName, id) {
    return this.buildURLFromBase(
      `${this.namespace_v2}/partners/${
        this.organization.selected.id
      }/registration_requests${id ? '/' + id : ''}`
    );
  }

  async patch(id, modelName, snapshot, data) {
    const url = this.buildURL(modelName, id);
    await this.ajax(url, 'PATCH', { data });
    return this.store.findRecord(modelName, id);
  }

  async resend(id, modelName) {
    const url = `${this.buildURL(modelName, id)}/resend`;
    return await this.ajax(url, 'POST', {});
  }

  createRecord(store, modelClass, snapshot) {
    let url = this.buildURL(
      modelClass.modelName,
      null,
      snapshot,
      'createRecord'
    );
    // ref https://github.com/emberjs/data/blob/c421bb41e727de30de717f01b3c24c7cdcef0b8a/packages/adapter/addon/-private/utils/serialize-into-hash.js#L2
    const serializer = store.serializerFor(modelClass.modelName);

    const body = {};
    serializer.serializeIntoHash(body, modelClass, snapshot);

    return this.ajax(url, 'POST', {
      data: {
        email: body.email,
        company: body.data.company,
        first_name: body.data.first_name,
        last_name: body.data.last_name,
      },
    });
  }
}
