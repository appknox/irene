import Component from '@glimmer/component';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';

import type PartnerclientModel from 'irene/models/partner/partnerclient';
import type PartnerService from 'irene/services/partner';

export interface PartnerClientInfoComponentSignature {
  Args: {
    client: PartnerclientModel;
    showDetailLink?: boolean;
  };
}

export default class PartnerClientInfoComponent extends Component<PartnerClientInfoComponentSignature> {
  @service declare partner: PartnerService;

  get isEmptyTitle() {
    return isEmpty(this.args.client.name);
  }

  get showCreditTransferOption() {
    return (
      this.partner.access?.transfer_credits && this.partner.access.view_plans
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::ClientInfo': typeof PartnerClientInfoComponent;
  }
}
