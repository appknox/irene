/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class ProjectTeam extends commondrf {
  _buildURL(modelName, id) {
    const baseURL = `${this.get('namespace')}/organizations/${
      this.get('organization').selected.id
    }/projects`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  _buildNestedURL(modelName, projectId, id) {
    const projectURL = this._buildURL(modelName, projectId);
    const teamURL = [projectURL, 'teams'].join('/');

    if (id) {
      return `${teamURL}/${encodeURIComponent(id)}`;
    }

    return teamURL;
  }

  urlForQuery(query, modelName) {
    return this._buildNestedURL(modelName, query.projectId);
  }

  urlForQueryRecord(query, modelName) {
    return this._buildNestedURL(modelName, query.projectId, query.id);
  }
}
