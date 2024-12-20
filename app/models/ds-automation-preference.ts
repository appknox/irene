import Model, { attr } from '@ember-data/model';

export default class DsAutomationPreferenceModel extends Model {
  @attr('boolean')
  declare dynamicScanAutomationEnabled: boolean;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'ds-automation-preference': DsAutomationPreferenceModel;
  }
}
