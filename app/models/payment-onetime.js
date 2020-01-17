import DS from 'ember-data';
import {computed} from "@ember/object";

export default DS.Model.extend({

  DEFAULT_STATUS: 2,
  statusTextList : ['Active','Expired','Errored'],

  plan: DS.belongsTo('pricing-plan'),
  createdOn: DS.attr('date'),
  expiryDate: DS.attr('date'),
  lastPaidOn: DS.attr('date'),
  quantityPurchased: DS.attr('number'),
  quantityRemaining: DS.attr('date'),
  status: DS.attr('number'),

  statusText: computed('status',function(){
    const subscriptionStatusValue = this.get('status');
    const subscriptionText = this.get('statusTextList')[subscriptionStatusValue];
    return subscriptionText ? subscriptionText : this.get('statusTextList')[this.get('DEFAULT_STATUS')];
  })
});
