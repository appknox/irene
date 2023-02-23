import commondrf from './commondrf';

export default class OrganizationTeamMemberAdapter extends commondrf {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace}/organizations/${this.organization.selected?.id}/teams`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  _buildNestedURL(
    modelName?: string | number,
    teamId?: string | number,
    id?: string | number
  ) {
    const teamURL = this._buildURL(modelName, teamId);
    const projectURL = [teamURL, 'members'].join('/');

    if (id) {
      return `${projectURL}/${encodeURIComponent(id)}`;
    }

    return projectURL;
  }

  urlForQuery(
    query: { teamId?: string | number },
    modelName?: string | number
  ) {
    return this._buildNestedURL(modelName, query.teamId);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-team-member': OrganizationTeamMemberAdapter;
  }
}
