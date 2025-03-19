import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type IreneAjaxService from 'irene/services/ajax';
import type MeService from 'irene/services/me';
import type PartnerService from 'irene/services/partner';
import type PartnerclientModel from 'irene/models/partner/partnerclient';
import type PartnerclientPlanModel from 'irene/models/partner/partnerclient-plan';
import type PartnerPlanModel from 'irene/models/partner/plan';

export interface PartnerCreditTransferComponentSignature {
  Element: HTMLElement;
  Args: {
    client?: PartnerclientModel;
  };
}

export default class PartnerCreditTransferComponent extends Component<PartnerCreditTransferComponentSignature> {
  @service declare store: Store;
  @service declare ajax: IreneAjaxService;
  @service declare me: MeService;
  @service declare partner: PartnerService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked availableCredits = 0;
  @tracked transferCount = 1;
  @tracked isPerScan = true;
  @tracked isShowModal = false;
  @tracked isEditMode = true;

  @tracked partnerPlan: PartnerPlanModel | null = null;
  @tracked clientPlan: PartnerclientPlanModel | null = null;

  get clientName() {
    return isEmpty(this.args.client?.name) ? null : this.args.client?.name;
  }

  get partnerPlanScansLeft() {
    return this.partnerPlan?.scansLeft;
  }

  get remainingCredits() {
    return (
      parseInt(String(this.partnerPlanScansLeft)) -
      (parseInt(String(this.transferCount)) || 0)
    );
  }

  get buttonTooltip() {
    let tooltipMsg = '';

    if (this.partnerPlanScansLeft === 0) {
      tooltipMsg = this.intl.t('0sharableCredits');
    }

    if (!this.clientPlan?.limitedScans) {
      tooltipMsg = this.intl.t('perAppCreditTransferStatus');
    }

    return tooltipMsg;
  }

  get disableTransfer() {
    return this.partnerPlanScansLeft === 0 || !this.clientPlan?.limitedScans;
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
  updateTransferCount(value: number) {
    this.transferCount = value;
  }

  @action
  toggleMode() {
    this.isEditMode = !this.isEditMode;
  }

  @action
  transferCredits() {
    this.transferCreditsToClient.perform();
  }

  fetchPartnerPlan = task(async () => {
    try {
      this.partnerPlan = await this.store.queryRecord('partner/plan', {});
    } catch (error) {
      // Do nothing with error
      return;
    }
  });

  fetchClientPlan = task(async () => {
    if (!this.args.client) {
      return;
    }

    try {
      this.clientPlan = await this.store.findRecord(
        'partner/partnerclient-plan',
        this.args.client.id
      );
    } catch (error) {
      // Do nothing with error
      return;
    }
  });

  transferCreditsToClient = task(async () => {
    try {
      await this.clientPlan?.transferScans(this.transferCount);

      this.notify.success(this.intl.t('creditTransferSuccess'));

      // Refresh credit balance for partner & client
      this.fetchClientPlan.perform();
      this.fetchPartnerPlan.perform();

      this.toggleModal();
      this.resetToDefault();
    } catch {
      this.notify.error(this.intl.t('creditTransferError'));
    }
  });

  @action
  resetToDefault() {
    this.transferCount = 1;
    this.isEditMode = true;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::CreditTransfer': typeof PartnerCreditTransferComponent;
  }
}
