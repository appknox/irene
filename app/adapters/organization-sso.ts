import commondrf from './commondrf';

export default class OrganizationSSOAdapter extends commondrf {
  _buildURL() {
    const baseURL = `${this.namespace}/v2/sso/provider`;

    return this.buildURLFromBase(baseURL);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-sso': OrganizationSSOAdapter;
  }
}
