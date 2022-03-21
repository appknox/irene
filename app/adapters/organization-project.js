/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class OrganizationProject extends commondrf {

  _buildURL(modelName, id) {
    const baseurl = `${this.get('namespace')}/organizations/${this.get('organization').selected.id}/projects`;
    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(baseurl);
  }

  addCollaborator(store, type, snapshot, data, collaboratorId) {
    let id = snapshot.id;
    const url = this.urlForAddCollaborator(id, type.modelName, snapshot, collaboratorId);
    return this.ajax(url, 'PUT', {
      data
    });
  }

  urlForAddCollaborator(id, modelName, snapshot, collaboratorId) {
    const baseURL = this._buildURL(modelName, id);
    return [baseURL, 'collaborators', collaboratorId].join('/');
  }
}
