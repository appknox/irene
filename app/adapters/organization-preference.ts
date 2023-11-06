import commondrf from './commondrf';

export default class OrganizationPreferenceAdapter extends commondrf {
  _buildURL() {
    return this.buildURLFromBase(
      `${this.namespace}/organizations/${this.organization.selected?.id}/preference`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-preference': OrganizationPreferenceAdapter;
  }
}
