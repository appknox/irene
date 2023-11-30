import Model, { attr } from '@ember-data/model';
import dayjs from 'dayjs';

export type PartnerclientPlanModelName = 'partner/partnerclient-plan';

export default class PartnerclientPlanModel extends Model {
  private modelName =
    PartnerclientPlanModel.modelName as PartnerclientPlanModelName;

  @attr('number')
  declare scansLeft: number;

  @attr('boolean')
  declare limitedScans: boolean;

  @attr('number')
  declare projectsLimit: number;

  @attr('date')
  declare expiryDate: Date;

  get isPaymentExpired(): boolean {
    return dayjs().isAfter(this.expiryDate);
  }

  transferScans(count: number) {
    const adapter = this.store.adapterFor(this.modelName);

    return adapter.transferScans(this.id, {
      count,
    });
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'partner/partnerclient-plan': PartnerclientPlanModel;
  }
}
