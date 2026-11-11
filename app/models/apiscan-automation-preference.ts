import Model, { attr } from '@ember-data/model';

export default class ApiscanAutomationPreferenceModel extends Model {
  @attr('boolean')
  declare apiScanAutomationEnabled: boolean;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'apiscan-automation-preference': ApiscanAutomationPreferenceModel;
  }
}
