import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

import type Store from 'ember-data/store';
import type PartnerService from 'irene/services/partner';
import type PartnerclientPlanModel from 'irene/models/partner/partnerclient-plan';

export interface PartnerClientPlanComponentSignature {
  Element: HTMLElement;
  Args: {
    clientId: string | number;
  };
}

export default class PartnerClientPlanComponent extends Component<PartnerClientPlanComponentSignature> {
  @service declare store: Store;
  @service declare partner: PartnerService;

  @tracked clientPlan: PartnerclientPlanModel | null = null;

  getClientPlan = task(async () => {
    try {
      this.clientPlan = await this.store.findRecord(
        'partner/partnerclient-plan',
        this.args.clientId
      );
    } catch (err) {
      this.clientPlan = null;
      return;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::ClientPlan': typeof PartnerClientPlanComponent;
  }
}
