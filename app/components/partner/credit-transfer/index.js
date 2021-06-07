import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default class PartnerCreditTransferComponent extends Component {
  @service store;
  @service ajax;
  @service me;
  @service('notifications') notify;

  @tracked availableCredits = 0;

  @tracked transferCount = 0;

  @tracked isPerScan = true;

  @tracked isShowModal = false;

  @tracked partnerPlan = {};

  @tracked clientPlan = {};

  get isEmptyTitle() {
    return isEmpty(this.args.client.name);
  }

  // @computed('availableCredits', 'transferCount')
  get balCredits() {
    return (
      parseInt(this.partnerPlan.scansLeft) - (parseInt(this.transferCount) || 0)
    );
  }

  // @computed('partnerPlan', 'transferCount', 'balCredits')
  get isValidNumber() {
    const transferCount = Number(this.transferCount);
    return transferCount
      ? transferCount > 0 &&
          Number.isInteger(transferCount) &&
          this.balCredits >= 0
      : false;
  }

  @action
  initializeComp() {
    this.fetchPartnerPlan.perform();
    this.fetchClientPlan.perform();
  }

  @action
  toggleModal() {
    this.isShowModal = !this.isShowModal;
  }

  @task(function* () {
    try {
      this.partnerPlan = yield this.store.queryRecord('partner/plan', {});
    } catch {
      return;
    }
  })
  fetchPartnerPlan;

  @task(function* () {
    try {
      this.clientPlan = yield this.store.find(
        'partner/partnerclient-plan',
        this.args.client.id
      );
    } catch {
      return;
    }
  })
  fetchClientPlan;

  @task(function* () {
    try {
      yield this.ajax.put(`partnerclients/${this.args.client.id}/add_credits`, {
        namespace: 'api/v2',
        data: {
          credits_to_add: parseInt(this.transferCount),
        },
      });
      this.notify.success('Credits transferred to cilent');
      // Refresh credit balance for partner & client
      yield this.store.find('partnerclient', this.args.client.id);
      yield this.store.queryRecord('partner-credit-stat', {});
      this.args.onClose();
    } catch {
      this.notify.error(`Couldn't transfer credits, please try again later!`);
    }
  })
  tranferCredits;
}
