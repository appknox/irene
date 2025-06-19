import Model, { attr } from '@ember-data/model';
import ENUMS from 'irene/enums';

export default class ScanCoverageModel extends Model {
  @attr('number')
  declare totalNumOfScreens: number;

  @attr('number')
  declare totalNumOfVisitedScreens: number;

  @attr('number')
  declare coverage: number;

  @attr('boolean')
  declare isAnyScreenCoverageComplete: boolean;

  @attr('number')
  declare status: number;

  @attr('string')
  declare statusLabel: string;

  @attr('string')
  declare errorCode: string;

  @attr('string')
  declare errorMessage: string;

  get coverageIsInProgress() {
    return [
      ENUMS.SCAN_COVERAGE_STATUS.PROCESSING_DS_EVENTS,
      ENUMS.SCAN_COVERAGE_STATUS.GENERATING_APP_SCREENS,
      ENUMS.SCAN_COVERAGE_STATUS.CALCULATING_SCREEN_COVERAGE,
    ].includes(this.status);
  }

  get coverageIsNotStarted() {
    return this.status === ENUMS.SCAN_COVERAGE_STATUS.NOT_STARTED;
  }

  get coverageIsErrored() {
    return this.status === ENUMS.SCAN_COVERAGE_STATUS.ERROR;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'scan-coverage': ScanCoverageModel;
  }
}
