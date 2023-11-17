import Model, {
  AsyncBelongsTo,
  AsyncHasMany,
  attr,
  belongsTo,
  hasMany,
} from '@ember-data/model';

import UserModel from '../user';
import SecurityFileModel from './file';

export default class SecurityProjectModel extends Model {
  @attr('string')
  declare packageName: string;

  @attr('boolean')
  declare isManualScanAvailable: boolean;

  @belongsTo('user', { inverse: 'ownedProjects' })
  declare owner: AsyncBelongsTo<UserModel>;

  @hasMany('security/file')
  declare files: AsyncHasMany<SecurityFileModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'security/project': SecurityProjectModel;
  }
}
