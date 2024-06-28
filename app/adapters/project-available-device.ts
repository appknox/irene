import commondrf from './commondrf';

interface ProjectAvailableDevicesQueryObj {
  projectId: string | number;
  manualDevices?: boolean;
}
export default class ProjectAvailableDeviceAdapter extends commondrf {
  _buildURL(
    modelName: string | number,
    id: string | number,
    namespace = this.namespace
  ) {
    const baseURL = `${namespace}/projects`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  _buildNestedURL(
    modelName: string | number,
    query: ProjectAvailableDevicesQueryObj
  ) {
    let url = '';

    if (query.manualDevices) {
      url = this.getAvailableManualDevicesURL(query);

      delete query.manualDevices;
    } else {
      const projectURL = this._buildURL(modelName, query.projectId);
      url = [projectURL, 'available-devices'].join('/');
    }

    return url;
  }

  urlForQuery<K extends string | number>(
    query: ProjectAvailableDevicesQueryObj,
    modelName: K
  ) {
    return this._buildNestedURL(modelName, query);
  }

  getAvailableManualDevicesURL(query: ProjectAvailableDevicesQueryObj) {
    const projectURL = this._buildURL(
      'project',
      query.projectId,
      this.namespace_v2
    );

    const url = projectURL + '/available_manual_devices';

    return url;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'project-available-device': ProjectAvailableDeviceAdapter;
  }
}
