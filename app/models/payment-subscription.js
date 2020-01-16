import DS from 'ember-data';
import {computed} from "@ember/object";

export default DS.Model.extend({
  // STATUS_ACTIVE: 0,
  // STATUS_CANCELLED: 1,
  // STATUS_EXPIRED: 2,
  // STATUS_INVALID_CARD: 3,
  DEFAULT_STATUS: 4,
  statusTextList : ['Active','Cancelled','Expired','Invalid Card','Errored'],

  plan: DS.attr(),
  billingCycle: DS.attr('number'),
  createdOn: DS.attr('date'),
  expiryDate: DS.attr('date'),
  nextBillingDate: DS.attr('date'),
  lastPaidOn: DS.attr('date'),
  quantityBought: DS.attr('number'),
  quantityUsed: DS.attr('date'),
  status: DS.attr('number'),

  statusText: computed('status',function(){
    const subscriptionStatusValue = this.get('status');
    const subscriptionText = this.get('statusTextList')[subscriptionStatusValue];
    return subscriptionText ? subscriptionText : this.get('statusTextList')[this.get('DEFAULT_STATUS')];
  })
});
