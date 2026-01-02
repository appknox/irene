import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import type Store from 'ember-data/store';
import type PartnerPlanModel from 'irene/models/partner/plan';
import type PartnerService from 'irene/services/partner';

export default class PartnerPartnerPlanComponent extends Component {
  @service declare store: Store;
  @service declare partner: PartnerService;

  @tracked partnerPlan: PartnerPlanModel | null = null;

  @action
  initialize() {
    this.fetchPartnerPlan.perform();
  }

  fetchPartnerPlan = task(async () => {
    try {
      this.partnerPlan = await this.store.queryRecord('partner/plan', {});
    } catch {
      this.partnerPlan = null;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::PartnerPlan': typeof PartnerPartnerPlanComponent;
  }
}
