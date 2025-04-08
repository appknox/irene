import CommonDRFAdapter from './commondrf';

export type PermissionDataQuery = {
  fileId?: string;
  permissionId?: string;
};

export default class DangerousPermissionAdapter extends CommonDRFAdapter {
  _buildNestedURL(
    modelName: string | number,
    fileId?: string,
    permissionId?: string
  ) {
    const filesURL = `${this.namespace_v2}/permission_request/${permissionId}/permission_data`;

    return this.buildURLFromBase(filesURL);
  }

  urlForQuery(query: PermissionDataQuery, modelName: string | number) {
    const { fileId, permissionId } = query;

    delete query.fileId;
    delete query.permissionId;

    return this._buildNestedURL(modelName, fileId, permissionId);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'dangerous-permission': DangerousPermissionAdapter;
  }
}
