import Component from '@glimmer/component';
import {
  tracked
} from '@glimmer/tracking';
import {
  task
} from 'ember-concurrency';
import {
  inject as service
} from '@ember/service';
import {
  computed
} from '@ember/object';

export default class ModalsClientCreditTransfer extends Component {

  @service store;
  @service ajax;
  @service me;

  @tracked availableCredits = 0;

  @tracked transferCount = 0;

  @tracked isPerScan = true;

  @computed('availableCredits', 'transferCount')
  get balCredits() {
    return parseInt(this.availableCredits) - (parseInt(this.transferCount) || 0);
  }

  @computed('availableCredits', 'transferCount')
  get isValidNumber() {
    const transferCount = Number(this.transferCount);
    return transferCount ? transferCount > 0 && Number.isInteger(transferCount) : false;
  }

  @task(function* () {
    const creditsStats = yield this.store.queryRecord('credits/partner-credits-stat', {});
    this.availableCredits = creditsStats.creditsLeft || 0;
    this.isPerScan = creditsStats.isPerScan || true;
  }) fetchPartnerCredits;

  @task(function* () {
    yield this.ajax.put(`${this.me.partner.id}/clients/${this.args.client.id}/add_credits`, {
      namespace: 'api/v2/partner',
      data: {
        "credits_to_add": 1
      }
    });
    this.args.onClose();
  }) tranferCredits;
}
