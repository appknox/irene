import commondrf from './commondrf';

export default class OrganizationMemberAdapter extends commondrf {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseurl = `${this.namespace}/organizations/${this.organization?.selected?.id}/members`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-member': OrganizationMemberAdapter;
  }
}
