import commondrf from './commondrf';
import Store from 'ember-data/store';
import OrganizationProjectModel, {
  OrganizationProjectModelName,
  AddProjectData,
} from 'irene/models/organization-project';

export default class OrganizationProjectAdapter extends commondrf {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseurl = `${this.namespace}/organizations/${this.organization.selected?.id}/projects`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }

  addCollaborator(
    store: Store,
    modelName: OrganizationProjectModelName,
    snapshot: OrganizationProjectModel,
    data: AddProjectData,
    collaboratorId: string
  ) {
    const id = snapshot.id;

    const url = this.urlForAddCollaborator(
      id,
      modelName,
      snapshot,
      collaboratorId
    );
    return this.ajax(url, 'PUT', {
      data,
    });
  }

  urlForAddCollaborator(
    id: string,
    modelName: OrganizationProjectModelName,
    snapshot: OrganizationProjectModel,
    collaboratorId: string
  ) {
    const baseURL = this._buildURL(modelName, id);

    return [baseURL, 'collaborators', collaboratorId].join('/');
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-project': OrganizationProjectAdapter;
  }
}
