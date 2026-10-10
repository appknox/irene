import Model, { attr } from '@ember-data/model';

export default class ApiscanAutomationPreferenceModel extends Model {
  @attr('boolean')
  declare apiScanAutomationEnabled: boolean;

  // Empty means "no domain restriction" - every captured host is in scope.
  @attr
  declare apiScanAutomationIncludedDomains: string[];

  @attr
  declare apiScanAutomationExcludedDomains: string[];

  @attr
  declare apiScanAutomationExcludedEndpoints: string[];
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'apiscan-automation-preference': ApiscanAutomationPreferenceModel;
  }
}
