import DS from 'ember-data';
import {computed} from '@ember/object';

export default DS.Model.extend({
  name: DS.attr('string'),
  active: DS.attr('boolean'),
  description: DS.attr('string'),
  isHighlighted: DS.attr('boolean'),
  price: DS.attr('string'),
  currency: DS.attr('string'),
  quantity: DS.attr('number'),
  type: DS.attr('number'),
  expiryDuration: DS.attr('string'),
  billingCycle: DS.attr('string'),
  features: DS.attr(),
  isManualscanIncluded: DS.attr('boolean'),
  manualscanCount: DS.attr('number'),

  allowQuantityInput: computed('quantity',function(){
    return ! this.get('quantity');
  }),

  async stripeSessionId(data){
    const adapter = this.store.adapterFor('pricing-plan');
    let sessionId = null;
    try{
      const response = await adapter.getStripeSessionId(data);
      if(response && response.id){
        sessionId =  response.id;
      }
      return sessionId;
    }catch(err){
      return sessionId;
    }
  }
});
