import Model, { attr } from '@ember-data/model';

// One record per file; its id is the file id.
export default class SecurityManualScanDetailModel extends Model {
  @attr() declare testers: string[];
  @attr() declare reviewers: string[];
  @attr('string') declare coveredScope: string;
  @attr('string') declare exemptedScope: string;
  @attr() declare coveredApiEndpoints: string[];
  @attr() declare exemptedApiEndpoints: string[];
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'security/manual-scan-detail': SecurityManualScanDetailModel;
  }
}
