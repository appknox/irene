import Component from '@glimmer/component';
import type PartnerRegistrationRequestModel from 'irene/models/partner/registration-request';

export interface PartnerRegistrationRequestPendingComponentSignature {
  Element: HTMLElement;
  Args: {
    request: PartnerRegistrationRequestModel;
    onApprove(request: PartnerRegistrationRequestModel): void;
    onReject(request: PartnerRegistrationRequestModel): void;
  };
}

export default class PartnerRegistrationRequestPendingComponent extends Component<PartnerRegistrationRequestPendingComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::RegistrationRequestPending': typeof PartnerRegistrationRequestPendingComponent;
  }
}
