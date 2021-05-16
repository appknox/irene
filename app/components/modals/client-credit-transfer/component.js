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
  @service('notifications') notify;

  @tracked availableCredits = 0;

  @tracked transferCount = 0;

  @tracked isPerScan = true;

  @computed('availableCredits', 'transferCount')
  get balCredits() {
    return parseInt(this.availableCredits) - (parseInt(this.transferCount) || 0);
  }

  @computed('availableCredits', 'transferCount', 'balCredits')
  get isValidNumber() {
    const transferCount = Number(this.transferCount);
    return transferCount ? transferCount > 0 && Number.isInteger(transferCount) && this.balCredits >= 0 : false;
  }

  @task(function* () {
    const creditsStats = yield this.store.queryRecord('partner-credit-stat', {});
    this.availableCredits = creditsStats.creditsLeft || 0;
    this.isPerScan = creditsStats.isPerScan || true;
  }) fetchPartnerCredits;

  @task(function* () {
    try {
      yield this.ajax.put(`partnerclients/${this.args.client.id}/add_credits`, {
        namespace: 'api/v2',
        data: {
          "credits_to_add": parseInt(this.transferCount)
        }
      });
      this.notify.success('Credits transferred to cilent')
      // Refresh credit balance for partner & client
      yield this.store.find('partnerclient', this.args.client.id);
      yield this.store.queryRecord('partner-credit-stat', {})
      this.args.onClose();
    } catch {
      this.notify.error(`Couldn't transfer credits, please try again later!`)
    }

  }) tranferCredits;
}
