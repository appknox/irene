import CommondrfNestedAdapter from './commondrf-nested';

export type DangerousPermissionRequestQuery = {
  fileId?: string;
};

export default class DangerousPermissionRequestAdapter extends CommondrfNestedAdapter {
  urlForQueryRecord(query: DangerousPermissionRequestQuery) {
    const { fileId } = query;

    delete query.fileId;

    return this.buildURLFromBase(
      `${this.namespace_v2}/files/${fileId}/permission_request`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'dangerous-permission-request': DangerousPermissionRequestAdapter;
  }
}
