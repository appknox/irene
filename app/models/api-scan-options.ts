/* eslint-disable ember/no-computed-properties-in-native-classes */
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import Model, { attr } from '@ember-data/model';

export default class ApiScanOptionsModel extends Model {
  @attr('string')
  declare apiUrlFilters: string;

  @computed('apiUrlFilters')
  get apiUrlFilterItems() {
    if (!isEmpty(this.apiUrlFilters)) {
      return this.apiUrlFilters != null
        ? this.apiUrlFilters.split(',')
        : undefined;
    }
  }

  get hasApiUrlFilters() {
    return this.apiUrlFilterItems?.length;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'api-scan-options': ApiScanOptionsModel;
  }
}
