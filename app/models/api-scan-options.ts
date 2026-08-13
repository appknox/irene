import { isEmpty } from '@ember/utils';
import Model, { attr } from '@ember-data/model';
import { uncountable } from '@ember-data/request-utils/string';

uncountable('api-scan-options');

export default class ApiScanOptionsModel extends Model {
  @attr
  declare dsApiCaptureFilters: string[];

  @attr
  declare apiScanAutomationEnabled: boolean;

  // Empty means "no domain restriction" - every captured host is in scope.
  @attr
  declare apiScanAutomationIncludedDomains: string[];

  @attr
  declare apiScanAutomationExcludedDomains: string[];

  @attr
  declare apiScanAutomationExcludedEndpoints: string[];

  get hasApiUrlFilters() {
    return !isEmpty(this.dsApiCaptureFilters);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'api-scan-options': ApiScanOptionsModel;
  }
}
