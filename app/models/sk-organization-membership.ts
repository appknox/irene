import Model, { type AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';

import type UserModel from './user';
import type SkOrganizationModel from './sk-organization';

export default class SkOrganizationMembershipModel extends Model {
  @attr('date')
  declare createdOn: Date;

  @attr('date')
  declare updatedOn: Date;

  @attr('number')
  declare role: number;

  @belongsTo('user', { async: false, inverse: null })
  declare member: UserModel;

  @belongsTo('sk-organization', { async: true, inverse: 'members' })
  declare skOrganization: AsyncBelongsTo<SkOrganizationModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-organization-membership': SkOrganizationMembershipModel;
  }
}
