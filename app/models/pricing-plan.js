import DS from 'ember-data';

export default DS.Model.extend({
  planId: DS.attr('string'),
  amountDecimal: DS.attr('number'),
  active: DS.attr('boolean'),
  currency: DS.attr('string'),
  interval: DS.attr('string'),
  intervalCount: DS.attr('number'),
  quantity: DS.attr('number'),
  metadata: DS.attr(),
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
