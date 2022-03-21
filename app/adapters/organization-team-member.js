/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class OrganizationTeamMember extends commondrf {

  _buildURL(modelName, id) {
    const baseURL = `${this.get('namespace')}/organizations/${this.get('organization').selected.id}/teams`;
    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(baseURL);
  }

  _buildNestedURL(modelName, teamId, id) {
    const teamURL = this._buildURL(modelName, teamId);
    const projectURL = [teamURL, 'members'].join('/');
    if (id) {
      return `${projectURL}/${encodeURIComponent(id)}`;
    }
    return projectURL;
  }

  urlForQuery(query, modelName) {
    return this._buildNestedURL(modelName, query.teamId);
  }
}
