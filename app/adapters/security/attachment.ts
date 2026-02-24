import commondrf from '../commondrf';

export default class SecurityAttachmentAdapter extends commondrf {
  _buildURL(modelName: string | number, id: string | number) {
    if (id) {
      return this.buildURLFromBase(
        `${this.hudson_namespace}/attachments/${id}`
      );
    }

    return this.buildURLFromBase(`${this.hudson_namespace}/attachments`);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'security/attachment': SecurityAttachmentAdapter;
  }
}
