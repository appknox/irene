import Model, {
  AsyncBelongsTo,
  AsyncHasMany,
  attr,
  belongsTo,
  hasMany,
} from '@ember-data/model';

import ProjectModel from './project';
import UserModel from './user';
import ScanParameterModel from './scan-parameter';

export default class ScanParameterGroupModel extends Model {
  @attr('string')
  declare name: string;

  @attr('string')
  declare description: string;

  @attr('boolean')
  declare isActive: boolean;

  @attr('boolean')
  declare isDefault: boolean;

  @attr('date')
  declare createdOn: Date;

  @attr('date')
  declare updatedOn: Date;

  @belongsTo('project', { async: true, inverse: null })
  declare project: AsyncBelongsTo<ProjectModel>;

  @belongsTo('user', { async: true, inverse: null })
  declare lastUpdatedBy: AsyncBelongsTo<UserModel> | null;

  @hasMany('scan-parameter', { inverse: 'scanParameterGroup', async: true })
  declare scanParameters: AsyncHasMany<ScanParameterModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'scan-parameter-group': ScanParameterGroupModel;
  }
}
