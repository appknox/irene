import commondrf from './commondrf';

export default class OrganizationNamespaceAdapter extends commondrf {
  _buildURL(modelName: string | number, id: string | number) {
    const namespace = this.namespace;
    const orgId = this.organization.selected?.id;
    const baseurl = `${namespace}/organizations/${orgId}/namespaces`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-namespace': OrganizationNamespaceAdapter;
  }
}
