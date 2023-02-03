/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr } from '@ember-data/model';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { Service as IntlService } from 'ember-intl';

export default class SubscriptionModel extends Model {
  @service declare intl: IntlService;

  @attr('string')
  declare subscriptionId: string;

  @attr('number')
  declare billingPeriod: number;

  @attr('string')
  declare billingPeriodUnit: string;

  @attr('number')
  declare planQuantity: number;

  @attr('date')
  declare expiryDate: Date;

  @attr('string')
  declare status: string;

  @attr('boolean')
  declare isActive: boolean;

  @attr('boolean')
  declare isTrial: boolean;

  @attr('boolean')
  declare isCancelled: boolean;

  @attr('boolean')
  declare isPerScan: boolean;

  @attr('string')
  declare planName: string;

  @computed('isCancelled')
  get isNotCancelled() {
    return !this.isCancelled;
  }

  @computed('expiryDate')
  get expiryDateOnHumanized() {
    return this.expiryDate.toLocaleDateString();
  }

  get tTrialWillExpireOn() {
    return this.intl.t('trialWillExpireOn');
  }

  get tYouWillBeChargedOn() {
    return this.intl.t('youWillBeChargedOn');
  }

  get tTrialWillBeConverted() {
    return this.intl.t('trialWillBeConverted');
  }

  get tSubscriptionWillExpireOn() {
    return this.intl.t('subscriptionWillExpireOn');
  }

  @computed('billingPeriod', 'billingPeriodUnit')
  get billingPeriodText() {
    const lcaseunit = (this.billingPeriodUnit || '').toLowerCase();

    if (lcaseunit == 'year') {
      return this.intl.t('yearWithNum', {
        numYears: this.billingPeriod,
      });
    }

    if (lcaseunit == 'month') {
      return this.intl.t('monthWithNum', {
        numMonths: this.billingPeriod,
      });
    }

    return this.billingPeriodUnit;
  }

  @computed(
    'isCancelled',
    'isTrial',
    'tSubscriptionWillExpireOn',
    'tTrialWillBeConverted',
    'tTrialWillExpireOn',
    'tYouWillBeChargedOn'
  )
  get subscriptionText() {
    if (this.isTrial && this.isCancelled) {
      return this.tTrialWillExpireOn;
    } else if (this.isTrial && !this.isCancelled) {
      return this.tTrialWillBeConverted;
    } else if (!this.isTrial && this.isCancelled) {
      return this.tSubscriptionWillExpireOn;
    } else if (!this.isTrial && !this.isCancelled) {
      return this.tYouWillBeChargedOn;
    }
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    subscription: SubscriptionModel;
  }
}
