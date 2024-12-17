import { attr } from '@ember-data/model';
import FileModel from './file';

export default class SkInventoryAppFileModel extends FileModel {
  @attr('number')
  declare riskCountCritical: number;

  @attr('number')
  declare riskCountHigh: number;

  @attr('number')
  declare riskCountLow: number;

  @attr('number')
  declare riskCountMedium: number;

  @attr('number')
  declare riskCountPassed: number;

  @attr('number')
  declare riskCountUnknown: number;

  @attr('date')
  declare lastScannedDate: Date;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-inventory-app-file': SkInventoryAppFileModel;
  }
}
