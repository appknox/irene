import commondrf from './commondrf';
import Store from 'ember-data/store';

import OrganizationTeamModel, {
  AddMemberData,
  AddProjectData,
  CreateInviteData,
  OrganizationTeamModelName,
} from 'irene/models/organization-team';
import OrganizationUserModel from 'irene/models/organization-user';

export default class OrganizationTeamAdapter extends commondrf {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseurl = `${this.namespace}/organizations/${this.organization.selected?.id}/teams`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }

  deleteMember(
    store: Store,
    modelName: OrganizationTeamModelName,
    snapshot: OrganizationTeamModel,
    user: OrganizationUserModel
  ) {
    const id = snapshot.id;
    const userId = user.get('id');

    const url = this.urlForDeleteMember(id, modelName, snapshot, userId);

    return this.ajax(url, 'DELETE');
  }

  urlForDeleteMember(
    id: string,
    modelName: OrganizationTeamModelName,
    snapshot: OrganizationTeamModel,
    userId: string
  ) {
    const baseURL = this._buildURL(modelName, id);

    return [baseURL, 'members', userId].join('/');
  }

  addMember(
    store: Store,
    modelName: OrganizationTeamModelName,
    snapshot: OrganizationTeamModel,
    data: AddMemberData,
    memberId: string
  ) {
    const id = snapshot.id;
    const url = this.urlForAddMember(id, modelName, snapshot, memberId);

    return this.ajax(url, 'PUT', {
      data,
    });
  }

  urlForAddMember(
    id: string,
    modelName: OrganizationTeamModelName,
    snapshot: OrganizationTeamModel,
    memberId: string
  ) {
    const baseURL = this._buildURL(modelName, id);

    return [baseURL, 'members', memberId].join('/');
  }

  addProject(
    store: Store,
    modelName: OrganizationTeamModelName,
    snapshot: OrganizationTeamModel,
    data: AddProjectData,
    projectId: string
  ) {
    const id = snapshot.id;
    const url = this.urlForAddProject(id, modelName, snapshot, projectId);

    return this.ajax(url, 'PUT', {
      data,
    });
  }

  urlForAddProject(
    id: string,
    modelName: OrganizationTeamModelName,
    snapshot: OrganizationTeamModel,
    projectId: string
  ) {
    const baseURL = this._buildURL(modelName, id);

    return [baseURL, 'projects', projectId].join('/');
  }

  createInvitation(
    store: Store,
    modelName: OrganizationTeamModelName,
    snapshot: OrganizationTeamModel,
    data: CreateInviteData
  ) {
    const id = snapshot.id;
    const url = this.urlForCreateInvitation(id, modelName);

    return this.ajax(url, 'POST', {
      data,
    });
  }

  urlForCreateInvitation(id: string, modelName: OrganizationTeamModelName) {
    const baseURL = this._buildURL(modelName, id);

    return [baseURL, 'invitations'].join('/');
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-team': OrganizationTeamAdapter;
  }
}
