import Model, { attr } from '@ember-data/model';

export default class ProjectTeamModel extends Model {
  @attr('string')
  declare name: string;

  @attr('boolean')
  declare write: boolean;

  @attr('number')
  declare membersCount: number;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'project-team': ProjectTeamModel;
  }
}
