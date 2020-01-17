import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: '',
  router: service(),

  planRoute: 'plan',
  methodRoute: 'payment-methods',
  invoiceRoute: 'invoices',



  currentSubRouteName: computed('router.currentRouteName',  function() {
    const routeTreeList = this.get('router.currentRouteName').split('.');
    return routeTreeList[routeTreeList.length - 1];
  }),

  isplanTab: computed('currentSubRouteName',function(){
    return this.get('currentSubRouteName') === this.get('planRoute');
  }),
  isMethodTab: computed('currentSubRouteName',function(){
    return this.get('currentSubRouteName') === this.get('methodRoute');
  }),
  isInvoicesTab: computed('currentSubRouteName',function(){
    return this.get('currentSubRouteName') === this.get('invoiceRoute');
  })

});

