import commondrf from './commondrf';

interface ProjectTeamQuery {
  projectId: string | number;
  id: string | number;
}

export default class ProjectTeam extends commondrf {
  _buildURL(modelName: string | number, id: string | number) {
    const baseURL = `${this.namespace}/organizations/${this.organization?.selected?.id}/projects`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  _buildNestedURL(
    modelName: string | number,
    projectId: string | number,
    id?: string | number
  ) {
    const projectURL = this._buildURL(modelName, projectId);
    const teamURL = [projectURL, 'teams'].join('/');

    if (id) {
      return `${teamURL}/${encodeURIComponent(id)}`;
    }

    return teamURL;
  }

  urlForQuery<K extends string | number>(
    query: ProjectTeamQuery,
    modelName: K
  ) {
    return this._buildNestedURL(modelName, query.projectId);
  }

  urlForQueryRecord<K extends string | number>(
    query: ProjectTeamQuery,
    modelName: K
  ) {
    return this._buildNestedURL(modelName, query.projectId, query.id);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'project-team': ProjectTeam;
  }
}
