import commondrf from './commondrf';
import Store from '@ember-data/store';
import OrganizationTeamProjectModel from '../models/organization-team-project';

type OrganizationTeamProjectQuery = {
  teamId: string | number;
  id: string | number;
};

export default class OrganizationTeamProject extends commondrf {
  _buildURL(modelName: string | number, id: string | number) {
    const baseURL = `${this.namespace}/organizations/${this.organization.selected?.id}/teams`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  _buildNestedURL(
    modelName: string | number,
    teamId: string | number,
    id?: string | number
  ) {
    const teamURL = this._buildURL(modelName, teamId);
    const projectURL = [teamURL, 'projects'].join('/');

    if (id) {
      return `${projectURL}/${encodeURIComponent(id)}`;
    }

    return projectURL;
  }

  urlForQuery<K extends string | number>(
    query: OrganizationTeamProjectQuery,
    modelName: K
  ) {
    return this._buildNestedURL(modelName, query.teamId);
  }

  urlForQueryRecord<K extends string | number>(
    query: OrganizationTeamProjectQuery,
    modelName: K
  ) {
    return this._buildNestedURL(modelName, query.teamId, query.id);
  }

  deleteProject(
    store: Store,
    modelName: string,
    snapshot: OrganizationTeamProjectModel,
    teamId: string | number
  ) {
    const id = snapshot.id;
    const url = this.urlForQueryRecord(
      {
        teamId,
        id,
      },
      modelName
    );

    return this.ajax(url, 'DELETE');
  }

  updateProject(
    store: Store,
    modelName: string,
    snapshot: OrganizationTeamProjectModel,
    teamId: string | number
  ) {
    const id = snapshot.id;

    const data = {
      write: snapshot.get('write'),
    };

    const url = this.urlForQueryRecord(
      {
        teamId,
        id,
      },
      modelName
    );

    return this.ajax(url, 'PUT', {
      data,
    });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-team-project': OrganizationTeamProject;
  }
}
