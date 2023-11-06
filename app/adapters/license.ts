import commondrf from './commondrf';

export default class LicenseAdapter extends commondrf {
  _buildURL() {
    const baseurl = `${this.namespace}/organizations/${this.organization.selected?.id}/license`;

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    license: LicenseAdapter;
  }
}
