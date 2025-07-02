import CommondrfNestedAdapter from './commondrf-nested';

export default class SkOrganizationSubAdapter extends CommondrfNestedAdapter {
  _buildURL() {
    return this.buildURLFromBase(`${this.namespace}/sk_subscription`);
  }

  setNestedUrlNamespace(orgId: string) {
    this.namespace = `${this.namespace_v2}/sk_organization/${orgId}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-organization-sub': SkOrganizationSubAdapter;
  }
}
