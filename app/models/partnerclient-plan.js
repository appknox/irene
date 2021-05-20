import Model, {
  attr
} from '@ember-data/model';
import {
  computed
} from '@ember/object';
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

  @computed('projectsLimit', 'limitedScans')
  get invalidPayment() {
    return this.projectsLimit === null && !this.limitedScans;
  }
}
