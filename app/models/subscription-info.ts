import Model, { attr } from '@ember-data/model';

export default class SubscriptionInfoModel extends Model {
  @attr('date')
  declare startDate: Date;

  @attr('date')
  declare expiryDate: Date;

  @attr('number')
  declare originalLicenses: number;

  @attr('number')
  declare licensesRemaining: number;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'subscription-info': SubscriptionInfoModel;
  }
}
