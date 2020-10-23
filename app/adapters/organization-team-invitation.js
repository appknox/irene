import commondrf from './commondrf';

export default class OrganizationTeamInvitation extends commondrf {

  _buildURL(modelName, id) {
    const baseURL = `${this.get('namespace')}/organizations/${this.get('organization').selected.id}/teams`;
    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(baseURL);
  }

  _buildNestedURL(modelName, teamId, id) {
    const teamURL = this._buildURL(modelName, teamId);
    const inviteURL = [teamURL, 'invitations'].join('/');
    if (id) {
      return `${inviteURL}/${encodeURIComponent(id)}`;
    }
    return inviteURL;
  }

  urlForQuery(query, modelName) {
    return this._buildNestedURL(modelName, query.teamId);
  }
}
