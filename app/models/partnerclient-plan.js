import Model, {
  attr
} from '@ember-data/model';
import {
  computed
} from '@ember/object';

export default class PartnerclientPlanModel extends Model {

  @attr('number') creditsLeft;
  @attr('boolean') isPerScan;

  @computed('creditsLeft', 'isPerScan')
  get invalidPayment() {
    return this.creditsLeft === null && !this.isPerScan;
  }
}
