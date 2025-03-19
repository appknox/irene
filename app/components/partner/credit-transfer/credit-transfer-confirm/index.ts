import Component from '@glimmer/component';
import type PartnerclientPlanModel from 'irene/models/partner/partnerclient-plan';
import type PartnerPlanModel from 'irene/models/partner/plan';

export interface PartnerCreditTransferCreditTransferConfirmComponentSignature {
  Element: HTMLElement;
  Args: {
    partnerPlan: PartnerPlanModel | null;
    remainingCredits: number;
    clientName?: string | null;
    clientPlan: PartnerclientPlanModel | null;
    transferCount: number;
    transferCredits: () => void;
    toggleMode: () => void;
  };
}

export default class PartnerCreditTransferCreditTransferConfirmComponent extends Component<PartnerCreditTransferCreditTransferConfirmComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::CreditTransfer::CreditTransferConfirm': typeof PartnerCreditTransferCreditTransferConfirmComponent;
  }
}
