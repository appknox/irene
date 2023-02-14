import Model, { attr, hasMany, AsyncHasMany } from '@ember-data/model';

import OrganizationTeamMemberModel from './organization-team-member';

export type AddMemberData = { write: boolean };
export type AddProjectData = { write: boolean };
export type CreateInviteData = { email: string };
export type OrganizationTeamModelName = 'organization-team';

export default class OrganizationTeamModel extends Model {
  private modelName =
    OrganizationTeamModel.modelName as OrganizationTeamModelName;

  @attr('string')
  declare name: string;

  @hasMany('organization-team-member')
  declare members: AsyncHasMany<OrganizationTeamMemberModel>;

  @attr('string')
  declare organization: string;

  @attr('date')
  declare createdOn: Date;

  @attr('number')
  declare membersCount: number;

  @attr('number')
  declare projectsCount: number;

  async deleteMember(member: OrganizationTeamMemberModel) {
    const adapter = this.store.adapterFor(this.modelName);

    await adapter.deleteMember(this.store, this.modelName, this, member);

    // TODO: fix this to do after showing notification
    this.members.removeObject(member);

    await this.members.reload();
    await this.store.unloadRecord(member);
  }

  async addMember(data: AddMemberData, id: string) {
    const adapter = this.store.adapterFor(this.modelName);

    return await adapter.addMember(this.store, this.modelName, this, data, id);
  }

  async addProject(data: AddProjectData, id: string) {
    const adapter = this.store.adapterFor(this.modelName);

    return await adapter.addProject(this.store, this.modelName, this, data, id);
  }

  async createInvitation(data: CreateInviteData) {
    const adapter = this.store.adapterFor(this.modelName);

    await adapter.createInvitation(this.store, this.modelName, this, data);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-team': OrganizationTeamModel;
  }
}
