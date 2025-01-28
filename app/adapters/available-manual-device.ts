import CommondrfNestedAdapter from './commondrf-nested';

export default class AvailableManualDeviceAdapter extends CommondrfNestedAdapter {
  setNestedUrlNamespace(projectId: string) {
    this.namespace = `${this.namespace_v2}/projects/${projectId}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'available-manual-device': AvailableManualDeviceAdapter;
  }
}
