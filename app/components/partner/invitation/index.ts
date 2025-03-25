import Component from '@glimmer/component';
import type PartnerRegistrationRequestModel from 'irene/models/partner/registration-request';

export interface PartnerInvitationComponentSignature {
  Element: HTMLElement;
  Args: {
    request: PartnerRegistrationRequestModel;
    onResend(request: PartnerRegistrationRequestModel): void;
    onDelete(request: PartnerRegistrationRequestModel): void;
  };
}

export default class PartnerInvitationComponent extends Component<PartnerInvitationComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::Invitation': typeof PartnerInvitationComponent;
  }
}
