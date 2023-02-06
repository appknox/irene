import Model, { attr } from '@ember-data/model';

export default class TeamMemberModel extends Model {
  @attr('string')
  declare username: string;

  @attr('string')
  declare email: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'team-member': TeamMemberModel;
  }
}
