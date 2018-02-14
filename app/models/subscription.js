/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import DS from 'ember-data';

const Subscription = DS.Model.extend({
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

  expiryDateOnHumanized: (function() {
    const expiryDate = this.get("expiryDate");
    return expiryDate.toLocaleDateString();
  }).property("expiryDate")
});

export default Subscription;
