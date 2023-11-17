/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, {
  attr,
  belongsTo,
  hasMany,
  AsyncBelongsTo,
  AsyncHasMany,
} from '@ember-data/model';
import ComputedProperty, { sort } from '@ember/object/computed';

import ENUMS from 'irene/enums';
import UserModel from '../user';
import SecurityProjectModel from './project';
import SecurityAnalysisModel from './analysis';

export default class SecurityFileModel extends Model {
  analysesSorting = ['risk:desc'];

  @attr('string')
  declare name: string;

  @attr('string')
  declare fileFormatDisplay: string;

  @attr('number')
  declare apiScanStatus: number;

  @belongsTo('user')
  declare user: AsyncBelongsTo<UserModel>;

  @belongsTo('security/project')
  declare project: AsyncBelongsTo<SecurityProjectModel>;

  @hasMany('security/analysis')
  declare analyses: AsyncHasMany<SecurityAnalysisModel>;

  @sort<SecurityAnalysisModel>('analyses', 'analysesSorting')
  declare sortedAnalyses: ComputedProperty<SecurityAnalysisModel[]>;

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
