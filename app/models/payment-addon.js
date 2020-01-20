import DS from 'ember-data';
import {computed} from "@ember/object";

export default DS.Model.extend({

  DEFAULT_STATUS: 2,
  statusTextList : ['Active','Expired','Errored'],

  addon: DS.attr(),
  createdOn: DS.attr('date'),
  expiryDate: DS.attr('date'),
  lastPaidOn: DS.attr('date'),
  scansPurchased: DS.attr('number'),
  scansRemaining: DS.attr('number'),
  rescansPurchased: DS.attr('number'),
  rescansRemaining: DS.attr('number'),
  status: DS.attr('number'),

  statusText: computed('status',function(){
    const subscriptionStatusValue = this.get('status');
    const subscriptionText = this.get('statusTextList')[subscriptionStatusValue];
    return subscriptionText ? subscriptionText : this.get('statusTextList')[this.get('DEFAULT_STATUS')];
  })
});
