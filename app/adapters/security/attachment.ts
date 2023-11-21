import commondrf from '../commondrf';

export default class SecurityAttachmentAdapter extends commondrf {
  namespace = 'api/hudson-api';

  _buildURL(modelName: string | number, id: string | number) {
    if (id) {
      return this.buildURLFromBase(`${this.namespace}/attachments/${id}`);
    }

    return this.buildURLFromBase(`${this.namespace}/attachments`);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'security/attachment': SecurityAttachmentAdapter;
  }
}
