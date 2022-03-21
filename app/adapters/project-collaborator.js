/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class ProjectCollaborator extends commondrf {

  _buildURL(modelName, id) {
    const baseURL = `${this.get('namespace')}/organizations/${this.get('organization').selected.id}/projects`;
    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(baseURL);
  }
  _buildNestedURL(modelName, projectId, id) {
    const projectURL = this._buildURL(modelName, projectId);
    const collaboratorURL = [projectURL, 'collaborators'].join('/');
    if (id) {
      return `${collaboratorURL}/${encodeURIComponent(id)}`;
    }
    return collaboratorURL;
  }
  urlForQuery(query, modelName) {
    return this._buildNestedURL(modelName, query.projectId);
  }
  urlForQueryRecord(query, modelName) {
    return this._buildNestedURL(modelName, query.projectId, query.id);
  }

  deleteCollaborator(store, type, snapshot, projectId) {
    const id = snapshot.id;
    const url = this.urlForQueryRecord({
      projectId,
      id
    }, type.modelName);
    return this.ajax(url, 'DELETE');
  }

  updateCollaborator(store, type, snapshot, projectId) {
    const id = snapshot.id;
    const data = {
      write: snapshot.get('write'),
    };
    const url = this.urlForQueryRecord({
      projectId,
      id
    }, type.modelName);
    return this.ajax(url, 'PUT', {
      data
    });
  }
}
