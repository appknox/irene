import commondrf from './commondrf';

interface ProjectAvailableDevicesQueryObj {
  projectId: string | number;
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
    const projectURL = this._buildURL(
      'project',
      query.projectId,
      this.namespace_v2
    );

    return projectURL + '/available_manual_devices';
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'project-available-device': ProjectAvailableDeviceAdapter;
  }
}
