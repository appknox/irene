import commondrf from './commondrf';

export default class OrganizationAiFeatureAdapter extends commondrf {
  _buildURL() {
    return this.buildURLFromBase(
      `${this.namespace}/organizations/${this.organization.selected?.id}/ai_features`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-ai-feature': OrganizationAiFeatureAdapter;
  }
}
