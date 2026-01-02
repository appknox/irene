import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';
import type Store from 'ember-data/store';

import type SubscriptionModel from 'irene/models/subscription';
import type PlanModel from 'irene/models/plan';
import ENUMS from 'irene/enums';

type SubscriptionsResponse = DS.AdapterPopulatedRecordArray<SubscriptionModel>;
type PlansResponse = DS.AdapterPopulatedRecordArray<PlanModel>;
type Duration = { key: string; value: number };

export default class OrganizationBillingComponent extends Component {
  @service declare store: Store;
  @service declare intl: IntlService;

  @tracked subscriptions: SubscriptionsResponse | null = null;
  @tracked plans: PlansResponse | null = null;
  @tracked paymentDuration = ENUMS.PAYMENT_DURATION.MONTHLY;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchSubscriptions.perform();
  }

  fetchSubscriptions = task(async () => {
    this.subscriptions = (await this.store.findAll(
      'subscription'
    )) as SubscriptionsResponse;

    if (this.subscriptions.isLoaded) {
      this.plans = (await this.store.findAll('plan')) as PlansResponse;
    }
  });

  get subscriptionList() {
    return this.subscriptions?.slice() || [];
  }

  get subscription() {
    return this.subscriptionList[0];
  }

  get subscriptionCount() {
    return this.subscriptionList.length;
  }

  get hasSubscription() {
    return this.subscriptionCount > 0;
  }

  get hasNoSubscription() {
    return this.subscriptionCount === 0;
  }

  get sortedPlans() {
    return this.plans?.slice().sort((a, b) => {
      const idA = Number(a.id);
      const idB = Number(b.id);

      return idA - idB; // ascending order
    });
  }

  get durations() {
    const durations = ENUMS.PAYMENT_DURATION.CHOICES as Duration[];

    return durations
      .slice(0, +(durations.length - 2) + 1 || undefined)
      .map((d) => ({
        ...d,
        label: this.getPlanDurationText(d.value as number),
      }));
  }

  getPlanDurationText(duration: number) {
    switch (duration) {
      case ENUMS.PAYMENT_DURATION.MONTHLY:
        return this.intl.t('monthly');

      case ENUMS.PAYMENT_DURATION.QUARTERLY:
        return this.intl.t('quarterly');

      case ENUMS.PAYMENT_DURATION.HALFYEARLY:
        return this.intl.t('halfYearly');

      default:
        return this.intl.t('yearly');
    }
  }

  @action
  selectDuration(duration: number) {
    this.paymentDuration = duration;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OrganizationBilling: typeof OrganizationBillingComponent;
  }
}
