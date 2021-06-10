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
  @service partner;
  @service intl;

  @tracked availableCredits = 0;

  @tracked transferCount = 1;

  @tracked isPerScan = true;

  @tracked isShowModal = false;

  @tracked partnerPlan = {};

  @tracked clientPlan = {};

  @tracked isEditMode = true;

  get isEmptyTitle() {
    return isEmpty(this.args.client.name);
  }

  // @computed('availableCredits', 'transferCount')
  get remainingCredits() {
    return (
      parseInt(this.partnerPlan.scansLeft) - (parseInt(this.transferCount) || 0)
    );
  }

  get buttonTooltip() {
    let tooltipMsg = this.intl.t('transferCredits');
    if (this.partnerPlan.scansLeft === 0) {
      tooltipMsg = this.intl.t('0sharableCredits');
    }
    if (!this.clientPlan.limitedScans) {
      tooltipMsg = this.intl.t('perAppCreditTransferStatus');
    }
    return tooltipMsg;
  }

  get disablePlusbtn() {
    return this.partnerPlan.scansLeft === 0 || !this.clientPlan.limitedScans;
  }

  // @computed('partnerPlan', 'transferCount', 'remainingCredits')

  @action
  initializeComp() {
    this.fetchPartnerPlan.perform();
    this.fetchClientPlan.perform();
  }

  @action
  toggleModal() {
    if (!this.disablePlusbtn) {
      this.isShowModal = !this.isShowModal;
    }
    this.resetToDefault();
  }

  @action
  toggleMode() {
    this.isEditMode = !this.isEditMode;
  }

  @task(function* () {
    try {
      this.partnerPlan = yield this.store.queryRecord('partner/plan', {});
      console.log('partnerPlan', this.partnerPlan);
    } catch (err) {
      console.log('err', err);
      return;
    }
  })
  fetchPartnerPlan;

  @task(function* () {
    try {
      console.log('this.args.client', this.args.client);
      this.clientPlan = yield this.store.find(
        'partner/partnerclient-plan',
        this.args.client.id
      );
      console.log('this.clientPlan', this.clientPlan);
    } catch (err) {
      console.log('er', err);
      return;
    }
  })
  fetchClientPlan;

  @task(function* () {
    try {
      // yield this.ajax.put(
      //   `partnerclients/${this.args.client.id}/transfer_scans`,
      //   {
      //     namespace: 'api/v2',
      //     data: {
      //       credits_to_add: parseInt(this.transferCount),
      //     },
      //   }
      // );
      yield this.clientPlan.transferScans(this.transferCount);
      this.notify.success('Credits transferred to cilent');
      // Refresh credit balance for partner & client
      this.fetchClientPlan.perform();
      this.fetchPartnerPlan.perform();
      this.toggleModal();
      this.resetToDefault();
    } catch {
      this.notify.error(`Couldn't transfer credits, please try again later!`);
    }
  })
  tranferCredits;

  resetToDefault() {
    this.transferCount = 1;
    this.isEditMode = true;
  }
}
