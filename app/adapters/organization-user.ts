import commondrf from './commondrf';

export default class OrganizationUser extends commondrf {
  _buildURL(modelName: string, id: string | number) {
    const baseurl = `${this.namespace}/organizations/${this.organization.selected?.id}/users`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-user': OrganizationUser;
  }
}
