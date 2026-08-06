/* eslint-disable ember/no-computed-properties-in-native-classes */
import type { AsyncBelongsTo, AsyncHasMany } from '@ember-data/model';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

import ENUMS from 'irene/enums';
import type UserModel from '../user';
import type SecurityProjectModel from './project';
import type SecurityAnalysisModel from './analysis';

export default class SecurityFileModel extends Model {
  @attr('string')
  declare name: string;

  @attr('string')
  declare fileFormatDisplay: string;

  @attr('number')
  declare apiScanStatus: number;

  @belongsTo('user', { async: true, inverse: null })
  declare user: AsyncBelongsTo<UserModel>;

  @belongsTo('security/project', { async: true, inverse: null })
  declare project: AsyncBelongsTo<SecurityProjectModel>;

  @hasMany('security/analysis', { async: true, inverse: 'file' })
  declare analyses: AsyncHasMany<SecurityAnalysisModel>;

  @attr('boolean')
  declare isDynamicDone: boolean;

  @attr('boolean')
  declare isStaticDone: boolean;

  @attr('number')
  declare manual: number;

  get isApiDone() {
    return this.apiScanStatus === ENUMS.SCAN_STATUS.COMPLETED;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'security/file': SecurityFileModel;
  }
}
