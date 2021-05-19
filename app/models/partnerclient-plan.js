import Model, {
  attr
} from '@ember-data/model';
import {
  computed
} from '@ember/object';

export default class PartnerclientPlanModel extends Model {

  @attr('number') scansLeft;
  @attr('boolean') limitedScans;
  @attr('number') projectsLimit;
  @attr('date') expiryDate;

  @computed('projectsLimit', 'limitedScans')
  get invalidPayment() {
    return this.projectsLimit === null && !this.limitedScans;
  }
}
