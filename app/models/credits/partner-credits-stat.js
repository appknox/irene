import Model, {
  attr
} from '@ember-data/model';
import {
  computed
} from '@ember/object';

export default class CreditsPartnerCreditsStatModel extends Model {

  @attr('number') creditsLeft;
  @attr('boolean') isPerScan;

  @computed('creditsLeft', 'isPerScan')
  get allowTransfer() {
    return this.creditsLeft > 0 && this.isPerScan;
  }
}
