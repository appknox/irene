import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import type FileModel from './file';

export type FileRiskCountByScanType = {
  static: number;
  dynamic: number;
  api: number;
  manual: number;
};

export default class FileRiskModel extends Model {
  @attr('number')
  declare rating: number;

  @attr('number')
  declare riskCountCritical: number;

  @attr('number')
  declare riskCountHigh: number;

  @attr('number')
  declare riskCountMedium: number;

  @attr('number')
  declare riskCountLow: number;

  @attr('number')
  declare riskCountPassed: number;

  @attr('number')
  declare riskCountUnknown: number;

  @attr('number')
  declare overriddenPassedRiskCount: number;

  @attr({
    defaultValue: () => ({
      static: 0,
      dynamic: 0,
      api: 0,
      manual: 0,
    }),
  })
  declare riskCountByScanType: FileRiskCountByScanType;

  @belongsTo('file', { async: true, inverse: null })
  declare file: AsyncBelongsTo<FileModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'file-risk': FileRiskModel;
  }
}
