import { action } from '@ember/object';
import Component from '@glimmer/component';
import type PartnerPlanModel from 'irene/models/partner/plan';

export interface PartnerCreditTransferCreditTransferInputComponentSignature {
  Element: HTMLElement;
  Args: {
    partnerPlan: PartnerPlanModel | null;
    remainingCredits: number;
    transferCount: number;
    clientName?: string | null;
    updateTransferCount(value: number): void;
    toggleMode: () => void;
  };
}

export default class PartnerCreditTransferCreditTransferInputComponent extends Component<PartnerCreditTransferCreditTransferInputComponentSignature> {
  get isValidInput() {
    const transferCount = Number(this.args.transferCount);

    return transferCount
      ? transferCount > 0 &&
          Number.isInteger(transferCount) &&
          this.args.remainingCredits >= 0
      : false;
  }

  @action updateTransferCount(ev: Event) {
    const value = (ev.currentTarget as HTMLInputElement).value;

    this.args.updateTransferCount(Number(value));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::CreditTransfer::CreditTransferInput': typeof PartnerCreditTransferCreditTransferInputComponent;
  }
}
