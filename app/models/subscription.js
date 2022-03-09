import Model, { attr } from '@ember-data/model';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { t } from 'ember-intl';

const Subscription = Model.extend({
  intl: service(),
  subscriptionId: attr('string'),
  billingPeriod: attr('number'),
  billingPeriodUnit: attr('string'),
  planQuantity: attr('number'),
  expiryDate: attr('date'),
  status: attr('string'),
  isActive: attr('boolean'),
  isTrial: attr('boolean'),
  isCancelled: attr('boolean'),
  isPerScan: attr('boolean'),
  planName: attr('string'),

  isNotCancelled: computed.not('isCancelled'),

  expiryDateOnHumanized: computed('expiryDate', function () {
    const expiryDate = this.get('expiryDate');
    return expiryDate.toLocaleDateString();
  }),

  tTrialWillExpireOn: t('trialWillExpireOn'),
  tYouWillBeChargedOn: t('youWillBeChargedOn'),
  tTrialWillBeConverted: t('trialWillBeConverted'),
  tSubscriptionWillExpireOn: t('subscriptionWillExpireOn'),

  billingPeriodText: computed(
    'billingPeriod',
    'billingPeriodUnit',
    function () {
      const intl = this.get('intl');
      const num = this.get('billingPeriod');
      const unit = this.get('billingPeriodUnit');
      const lcaseunit = (unit || '').toLowerCase();
      if (lcaseunit == 'year') {
        return intl.t('year', {
          numYears: num,
        });
      }
      if (lcaseunit == 'month') {
        return intl.t('month', {
          numMonths: num,
        });
      }
      return unit;
    }
  ),

  subscriptionText: computed(
    'isCancelled',
    'isTrial',
    'tSubscriptionWillExpireOn',
    'tTrialWillBeConverted',
    'tTrialWillExpireOn',
    'tYouWillBeChargedOn',
    function () {
      const isTrial = this.get('isTrial');
      const isCancelled = this.get('isCancelled');
      const tTrialWillExpireOn = this.get('tTrialWillExpireOn');
      const tYouWillBeChargedOn = this.get('tYouWillBeChargedOn');
      const tTrialWillBeConverted = this.get('tTrialWillBeConverted');
      const tSubscriptionWillExpireOn = this.get('tSubscriptionWillExpireOn');
      if (isTrial && isCancelled) {
        return tTrialWillExpireOn;
      } else if (isTrial && !isCancelled) {
        return tTrialWillBeConverted;
      } else if (!isTrial && isCancelled) {
        return tSubscriptionWillExpireOn;
      } else if (!isTrial && !isCancelled) {
        return tYouWillBeChargedOn;
      }
    }
  ),
});

export default Subscription;
