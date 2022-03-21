/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class ProjectAvailableDevice extends commondrf {

  _buildURL(modelName, id) {
    const baseURL = `${this.get('namespace')}/projects`;
    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(baseURL);
  }

  _buildNestedURL(modelName, projectId) {
    const projectURL = this._buildURL(modelName, projectId);
    const availableDevicesURL = [projectURL, 'available-devices'].join('/');
    return availableDevicesURL;
  }

  urlForQuery(query, modelName) {
    return this._buildNestedURL(modelName, query.projectId);
  }

}
