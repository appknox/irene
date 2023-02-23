import Model, { attr } from '@ember-data/model';

type OrganizationTeamProjectAdapterName = 'organization-team-project';

export default class OrganizationTeamProjectModel extends Model {
  private adapterName =
    OrganizationTeamProjectModel.modelName as OrganizationTeamProjectAdapterName;

  @attr('boolean')
  declare write: boolean;

  async deleteProject(teamId: string | number) {
    const adapter = this.store.adapterFor(this.adapterName);
    await adapter.deleteProject(this.store, this.adapterName, this, teamId);
  }

  async updateProject(teamId: string | number) {
    const adapter = this.store.adapterFor(this.adapterName);
    await adapter.updateProject(this.store, this.adapterName, this, teamId);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-team-project': OrganizationTeamProjectModel;
  }
}
