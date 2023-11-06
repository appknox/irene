import commondrf from './commondrf';

export default class OrganizationCleanupPreferenceAdapter extends commondrf {
  _buildURL() {
    return this.buildURLFromBase(
      `${this.namespace}/organizations/${this.organization.selected?.id}/cleanup-preference`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-cleanup-preference': OrganizationCleanupPreferenceAdapter;
  }
}
