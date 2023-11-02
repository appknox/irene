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

  get clientName() {
    return isEmpty(this.args.client.name) ? null : this.args.client.name;
  }

  get remainingCredits() {
    return (
      parseInt(this.partnerPlan.scansLeft) - (parseInt(this.transferCount) || 0)
    );
  }

  get buttonTooltip() {
    let tooltipMsg = null;

    if (this.partnerPlan.scansLeft === 0) {
      tooltipMsg = this.intl.t('0sharableCredits');
    }

    if (!this.clientPlan.limitedScans) {
      tooltipMsg = this.intl.t('perAppCreditTransferStatus');
    }

    return tooltipMsg;
  }

  get disableTransfer() {
    return this.partnerPlan.scansLeft === 0 || !this.clientPlan.limitedScans;
  }

  @action
  initializeComp() {
    this.fetchPartnerPlan.perform();
    this.fetchClientPlan.perform();
  }

  @action
  toggleModal() {
    if (!this.disableTransfer) {
      this.isShowModal = !this.isShowModal;
    }
    this.resetToDefault();
  }

  @action
  toggleMode() {
    this.isEditMode = !this.isEditMode;
  }

  @action
  transferCredits() {
    this.transferCreditsToClient.perform();
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
      yield this.clientPlan.transferScans(this.transferCount);
      this.notify.success(this.intl.t('creditTransferSuccess'));
      // Refresh credit balance for partner & client
      this.fetchClientPlan.perform();
      this.fetchPartnerPlan.perform();
      this.toggleModal();
      this.resetToDefault();
    } catch {
      this.notify.error(this.intl.t('creditTransferError'));
    }
  })
  transferCreditsToClient;

  resetToDefault() {
    this.transferCount = 1;
    this.isEditMode = true;
  }
}
