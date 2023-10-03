import Model, { attr } from '@ember-data/model';

export type ProjectCollaboratorModelName = 'project-collaborator';

export default class ProjectCollaboratorModel extends Model {
  private modelName =
    ProjectCollaboratorModel.modelName as ProjectCollaboratorModelName;

  @attr('boolean')
  declare write: boolean;

  @attr('boolean')
  declare isActive: boolean;

  @attr('string')
  declare username: string;

  @attr('string')
  declare email: string;

  async deleteCollaborator(projectId: string | number) {
    const adapter = this.store.adapterFor(this.modelName);

    await adapter.deleteCollaborator(
      this.store,
      this.modelName,
      this,
      projectId
    );
  }

  async updateCollaborator(projectId: string | number) {
    const adapter = this.store.adapterFor(this.modelName);

    await adapter.updateCollaborator(
      this.store,
      this.modelName,
      this,
      projectId
    );
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'project-collaborator': ProjectCollaboratorModel;
  }
}
