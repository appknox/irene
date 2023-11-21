import commondrf from './commondrf';

export default class TagAdapter extends commondrf {
  _buildURL(modelName: string | number, id: string | number) {
    const baseurl = this.buildURLFromBase(
      `${this.namespace}/organizations/${this.organization.selected?.id}/tags`
    );

    if (id) {
      return `${baseurl}/${encodeURIComponent(id)}`;
    }

    return baseurl;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    tag: TagAdapter;
  }
}
