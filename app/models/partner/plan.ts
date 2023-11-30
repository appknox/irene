import Model, { attr } from '@ember-data/model';

export default class PartnerPlanModel extends Model {
  @attr('date')
  declare expiryDate: Date;

  @attr('boolean')
  declare limitedScans: boolean;

  @attr('number')
  declare projectsLimit: number;

  @attr('number')
  declare scansLeft: number;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'partner/partner-plan': PartnerPlanModel;
  }
}
