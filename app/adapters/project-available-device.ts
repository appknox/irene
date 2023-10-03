import commondrf from './commondrf';

export default class ProjectAvailableDevice extends commondrf {
  _buildURL(modelName: string | number, id: string | number) {
    const baseURL = `${this.namespace}/projects`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  _buildNestedURL(modelName: string | number, projectId: string | number) {
    const projectURL = this._buildURL(modelName, projectId);
    const availableDevicesURL = [projectURL, 'available-devices'].join('/');
    return availableDevicesURL;
  }

  urlForQuery<K extends string | number>(
    query: { projectId: string | number },
    modelName: K
  ) {
    return this._buildNestedURL(modelName, query.projectId);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'project-available-device': ProjectAvailableDevice;
  }
}
