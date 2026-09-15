import commondrf from './commondrf';

export default class OrganizationCyodRegisteredDeviceAdapter extends commondrf {
  _buildURL() {
    return this.buildURLFromBase(
      `${this.namespace}/organizations/${this.organization.selected?.id}/registered-devices`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-cyod-registered-device': OrganizationCyodRegisteredDeviceAdapter;
  }
}
