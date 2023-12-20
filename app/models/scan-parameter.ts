import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';

import UserModel from './user';
import ScanParameterGroupModel from './scan-parameter-group';

export default class ScanParameterModel extends Model {
  @attr('string')
  declare name: string;

  @attr('string')
  declare value: string;

  @attr('boolean')
  declare isSecure: boolean;

  @attr('date')
  declare createdOn: Date;

  @attr('date')
  declare updatedOn: Date;

  @belongsTo('user')
  declare lastUpdatedBy: AsyncBelongsTo<UserModel> | null;

  @belongsTo('scan-parameter-group', { inverse: 'scanParameters' })
  declare scanParameterGroup: AsyncBelongsTo<ScanParameterGroupModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'scan-parameter': ScanParameterModel;
  }
}
