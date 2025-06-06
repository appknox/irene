import CommondrfNestedAdapter from './commondrf-nested';

export type DangerousPermissionRequestQuery = {
  fileId?: string;
};

export default class DangerousPermissionRequestAdapter extends CommondrfNestedAdapter {
  _buildURL() {
    return this.buildURLFromBase(`${this.namespace}/permission_request`);
  }

  setNestedUrlNamespace(fileId: string) {
    this.namespace = `${this.namespace_v2}/files/${fileId}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'dangerous-permission-request': DangerousPermissionRequestAdapter;
  }
}
