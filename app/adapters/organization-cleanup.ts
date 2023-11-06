import commondrf from './commondrf';

export default class OrganizationCleanupAdapter extends commondrf {
  _buildURL() {
    return this.buildURLFromBase(
      `${this.namespace}/organizations/${this.organization.selected?.id}/cleanups`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-cleanup': OrganizationCleanupAdapter;
  }
}
