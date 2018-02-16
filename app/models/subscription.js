import DS from 'ember-data';
import { translationMacro as t } from 'ember-i18n';

const Subscription = DS.Model.extend({
  i18n: Ember.inject.service(),
  subscriptionId: DS.attr('string'),
  billingPeriod: DS.attr('number'),
  billingPeriodUnit: DS.attr('string'),
  planQuantity: DS.attr('number'),
  expiryDate: DS.attr('date'),
  status: DS.attr('string'),
  isActive: DS.attr('boolean'),
  isTrial: DS.attr('boolean'),
  isCancelled: DS.attr('boolean'),
  isPerScan: DS.attr('boolean'),
  planName: DS.attr('string'),

  isNotCancelled: Ember.computed.not('isCancelled'),

  expiryDateOnHumanized: (function() {
    const expiryDate = this.get("expiryDate");
    return expiryDate.toLocaleDateString();
  }).property("expiryDate"),

  tTrialWillExpireOn: t("trialWillExpireOn"),
  tYouWillBeChargedOn: t("youWillBeChargedOn"),
  tTrialWillBeConverted: t("trialWillBeConverted"),
  tSubscriptionWillExpireOn: t("subscriptionWillExpireOn"),

  subscriptionText: (function() {
    const isTrial = this.get("isTrial");
    const isCancelled = this.get("isCancelled");
    const tTrialWillExpireOn = this.get("tTrialWillExpireOn");
    const tYouWillBeChargedOn = this.get("tYouWillBeChargedOn");
    const tTrialWillBeConverted = this.get("tTrialWillBeConverted");
    const tSubscriptionWillExpireOn = this.get("tSubscriptionWillExpireOn");
    if (isTrial && isCancelled) {
      return tTrialWillExpireOn;
    }
    else if (isTrial && !isCancelled) {
      return tYouWillBeChargedOn;
    }
    else if (!isTrial && isCancelled) {
      return tTrialWillBeConverted;
    }
    else if (!isTrial && !isCancelled) {
      return tSubscriptionWillExpireOn;
    }
  }).property("isTrial", "isCancelled")

});

export default Subscription;
