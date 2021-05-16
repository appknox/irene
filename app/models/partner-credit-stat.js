import Model, {
  attr
} from '@ember-data/model';
import {
  computed
} from '@ember/object';

export default class PartnerCreditStatModel extends Model {

  @attr('number') creditsLeft;
  @attr('boolean') isPerScan;

  @computed('creditsLeft', 'isPerScan')
  get allowTransfer() {
    // NOTE credit transfer only enabled for per-scan
    return this.creditsLeft > 0 && this.isPerScan;
  }
}
