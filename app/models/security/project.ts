import type { AsyncBelongsTo, AsyncHasMany } from '@ember-data/model';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

import type UserModel from '../user';
import type SecurityFileModel from './file';

export default class SecurityProjectModel extends Model {
  @attr('string')
  declare packageName: string;

  @attr('boolean')
  declare isManualScanAvailable: boolean;

  @belongsTo('user', { async: true, inverse: 'ownedProjects' })
  declare owner: AsyncBelongsTo<UserModel>;

  @hasMany('security/file', { async: true, inverse: null })
  declare files: AsyncHasMany<SecurityFileModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'security/project': SecurityProjectModel;
  }
}
