import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Store from '@ember-data/store';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import SubscriptionModel from 'irene/models/subscription';
import PlanModel from 'irene/models/plan';
import ENUMS from 'irene/enums';
import IntlService from 'ember-intl/services/intl';

type SubscriptionsResponse = DS.AdapterPopulatedRecordArray<SubscriptionModel>;
type PlansResponse = DS.AdapterPopulatedRecordArray<PlanModel>;
type Duration = { key: string; value: number };

export default class OrganizationBillingComponent extends Component {
  @service declare store: Store;
  @service declare intl: IntlService;

  @tracked subscriptions: SubscriptionsResponse | null = null;
  @tracked plans: PlansResponse | null = null;
  @tracked paymentDuration = ENUMS.PAYMENT_DURATION.MONTHLY;

  sortPlanProperties = ['id'];

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

  get subscription() {
    return this.subscriptions?.firstObject;
  }

  get subscriptionCount() {
    return (this.subscriptions?.toArray() || []).length;
  }

  get hasSubscription() {
    return this.subscriptionCount > 0;
  }

  get hasNoSubscription() {
    return this.subscriptionCount === 0;
  }

  get sortedPlans() {
    return this.plans?.sortBy(...this.sortPlanProperties);
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
