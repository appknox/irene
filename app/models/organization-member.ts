import Model, {
  attr,
  hasMany,
  AsyncHasMany,
  belongsTo,
  AsyncBelongsTo,
} from '@ember-data/model';

import OrganizationTeamModel from './organization-team';
import OrganizationUserModel from './organization-user';

export default class OrganizationMemberModel extends Model {
  @belongsTo('organization-user')
  declare member: AsyncBelongsTo<OrganizationUserModel>;

  @attr('number')
  declare role: number;

  @attr('string')
  declare roleDisplay: string;

  @attr('boolean')
  declare isAdmin: boolean;

  @attr('date')
  declare createdOn: Date;

  @hasMany('organization-team')
  declare teams: AsyncHasMany<OrganizationTeamModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-member': OrganizationMemberModel;
  }
}
