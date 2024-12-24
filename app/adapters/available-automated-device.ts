import CommondrfNestedAdapter from './commondrf-nested';

export default class AvailableAutomatedDeviceAdapter extends CommondrfNestedAdapter {
  setNestedUrlNamespace(projectId: string) {
    this.namespace = `${this.namespace_v2}/projects/${projectId}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'available-automated-device': AvailableAutomatedDeviceAdapter;
  }
}
