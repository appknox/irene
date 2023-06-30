/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class OrganizationTeamInvitationAdapter extends commondrf {

  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.get('namespace')}/organizations/${this?.get('organization')?.selected?.id}/teams`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  _buildNestedURL( modelName?: string | number,
    teamId?: string | number,
    id?: string | number) {
    const teamURL = this._buildURL(modelName, teamId);
    const inviteURL = [teamURL, 'invitations'].join('/');

    if (id) {
      return `${inviteURL}/${encodeURIComponent(id)}`;
    }

    return inviteURL;
  }

  urlForQuery( query: { teamId?: string | number },
    modelName?: string | number) {
    return this._buildNestedURL(modelName, query.teamId);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-team-invitation': OrganizationTeamInvitationAdapter;
  }
}
