import ProjectCollaboratorModel, {
  ProjectCollaboratorModelName,
} from 'irene/models/project-collaborator';
import commondrf from './commondrf';
import Store from '@ember-data/store';

interface ProjectCollaboratorQuery {
  projectId: string | number;
  id: string;
}

export default class ProjectCollaboratorAdapter extends commondrf {
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
    id?: string
  ) {
    const projectURL = this._buildURL(modelName, projectId);
    const collaboratorURL = [projectURL, 'collaborators'].join('/');

    if (id) {
      return `${collaboratorURL}/${encodeURIComponent(id)}`;
    }

    return collaboratorURL;
  }

  urlForQuery<K extends string | number>(
    query: ProjectCollaboratorQuery,
    modelName: K
  ) {
    return this._buildNestedURL(modelName, query.projectId);
  }

  urlForQueryRecord<K extends string | number>(
    query: ProjectCollaboratorQuery,
    modelName: K
  ) {
    return this._buildNestedURL(modelName, query.projectId, query.id);
  }

  deleteCollaborator(
    store: Store,
    type: ProjectCollaboratorModelName,
    snapshot: ProjectCollaboratorModel,
    projectId: string | number
  ) {
    const id = snapshot.id;
    const query = { projectId, id };
    const url = this.urlForQueryRecord(query, type);

    return this.ajax(url, 'DELETE');
  }

  updateCollaborator(
    store: Store,
    type: ProjectCollaboratorModelName,
    snapshot: ProjectCollaboratorModel,
    projectId: string | number
  ) {
    const id = snapshot.id;
    const data = {
      write: snapshot.get('write'),
    };

    const query = { projectId, id };
    const url = this.urlForQueryRecord(query, type);

    return this.ajax(url, 'PUT', {
      data,
    });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'project-collaborator': ProjectCollaboratorAdapter;
  }
}
