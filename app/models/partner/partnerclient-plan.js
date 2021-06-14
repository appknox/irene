import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';
import dayjs from 'dayjs';

export default class PartnerclientPlanModel extends Model {
  @attr('number') scansLeft;
  @attr('boolean') limitedScans;
  @attr('number') projectsLimit;
  @attr('date') expiryDate;

  @computed('expiryDate')
  get isPaymentExpired() {
    return dayjs().isAfter(this.expiryDate);
  }

  transferScans(count) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.transferScans(this.id, {
      count,
    });
  }
}
