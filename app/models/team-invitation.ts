import Model, { attr } from '@ember-data/model';

export default class TeamInvitationModel extends Model {
  @attr('number')
  declare role: number;

  @attr('string')
  declare email: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'team-invitation': TeamInvitationModel;
  }
}
