import Component from '@ember/component';
import { task } from 'ember-concurrency';

export default Component.extend({
  tagName: '',
  showCheckoutModal: false,
  planId: null,
  quantity: 1,

  getStripeSessionId: task(function * () {
    const stripeCheckoutSessionId = yield this.get('plan.stripeSessionId').call(this,{plan:this.get('planId'),quantity:this.get('quantity')});
    if(stripeCheckoutSessionId){
      const stripe = window.Stripe('pk_test_IMZbFpQo6Uavs7Q77Udp7E8u00c1dRKOsd');
      stripe.redirectToCheckout({sessionId:stripeCheckoutSessionId});
    }
    return null;
  }).evented(),



  actions: {
    openCheckoutModal(){
      this.set('planId',this.get('plan.id'));
      this.set('showCheckoutModal',true);
    }
  }
});
