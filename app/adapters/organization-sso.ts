import commondrf from './commondrf';

export default class OrganizationSSOAdapter extends commondrf {
  _buildURL() {
    return this.buildURLFromBase(
      `${this.namespace}/organizations/${this.organization.selected?.id}/sso/saml2`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-sso': OrganizationSSOAdapter;
  }
}
