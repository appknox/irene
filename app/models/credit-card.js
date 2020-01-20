import DS from 'ember-data';
import {computed} from "@ember/object";

export default DS.Model.extend({

  DEFAULT_STATUS: 3,
  statusTextList : ['Active','Expired','Blocked', "Errored"],

  createdOn: DS.attr('date'),
  lastFour: DS.attr('string'),
  cardCompany: DS.attr('string'),
  expirationMonth: DS.attr('string'),
  expirationYear: DS.attr('string'),
  status: DS.attr('number'),

  statusText: computed('status',function(){
    const subscriptionStatusValue = this.get('status');
    const subscriptionText = this.get('statusTextList')[subscriptionStatusValue];
    return subscriptionText ? subscriptionText : this.get('statusTextList')[this.get('DEFAULT_STATUS')];
  })
});
