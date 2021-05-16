import Component from '@glimmer/component';
import {
  inject as service
} from '@ember/service';

import {
  tracked
} from '@glimmer/tracking';
import {
  action
} from '@ember/object';
import {
  task
} from 'ember-concurrency';

export default class PartnerClientDetailsComponent extends Component {

  @service store;

  @tracked showCreditTransferModal = false;

  @tracked partnerCreditStats = {};

  @action
  initializeComp() {
    this.fetchPartnerCredits.perform();
  }

  @action
  toggleCreditTransferModal() {
    this.showCreditTransferModal = !this.showCreditTransferModal;
  }

  @task(function* () {
    this.partnerCreditStats = yield this.store.queryRecord('partner-credit-stat', {});
  }) fetchPartnerCredits;
}
