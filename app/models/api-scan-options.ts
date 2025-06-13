import { isEmpty } from '@ember/utils';
import Model, { attr } from '@ember-data/model';
import { uncountable } from '@ember-data/request-utils/string';

uncountable('api-scan-options');

export default class ApiScanOptionsModel extends Model {
  @attr
  declare dsApiCaptureFilters: string[];

  get hasApiUrlFilters() {
    return !isEmpty(this.dsApiCaptureFilters);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'api-scan-options': ApiScanOptionsModel;
  }
}
