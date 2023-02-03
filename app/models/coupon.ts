import Model, { attr } from '@ember-data/model';

export default class CouponModel extends Model {
  @attr('string')
  declare code: string;

  @attr('string')
  declare discount: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    coupon: CouponModel;
  }
}
