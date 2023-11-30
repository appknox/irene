import Model, { attr } from '@ember-data/model';

export default class PartnerPartnerclientReportUnlockkeyModel extends Model {
  @attr('string')
  declare unlockKey: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'partner/partnerclient-report-unlockkey': PartnerPartnerclientReportUnlockkeyModel;
  }
}
