import Component from '@glimmer/component';
import type PartnerRegistrationRequestModel from 'irene/models/partner/registration-request';

export interface PartnerRegistrationRequestRejectedComponentSignature {
  Element: HTMLElement;
  Args: {
    request: PartnerRegistrationRequestModel;
    onUndoReject(request: PartnerRegistrationRequestModel): void;
  };
}

export default class PartnerRegistrationRequestRejectedComponent extends Component<PartnerRegistrationRequestRejectedComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::RegistrationRequestRejected': typeof PartnerRegistrationRequestRejectedComponent;
  }
}
