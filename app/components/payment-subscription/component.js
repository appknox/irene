import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  isLoading: true,
  subscriptions: null,

  fetchSubscriptions(){
    return [
      {
        id: 1,
        plan: {
          name: 'Per App',
          description: 'Consectetur ad est laborum consequat ex dolore amet exercitation nulla cupidatat labore ut. Officia sint proident laboris incididunt dolore esse cillum. Id commodo est dolor veniam aliquip.',
          isHighlighted: false,
          isActive: true,
          price: '720',
          currency: 'USD',
          quantity: 1,
          type: 0,
          expiryDuration: "1 Year",
          billingCycle: "Year",
          features: [
            {
              text: 'feature description <span class="highlighted"> one of many </span> in description',
              is_highlighted: false
            },
            {
              text: 'feature description <span class="highlighted"> one of many </span> in description',
              is_highlighted: true
            },
            {
              text: 'feature description <span class="highlighted"> one of many </span> in description',
              is_highlighted: false
            }
          ],
          isManualscanIncluded: false,
          manualscanCount: 0,
        },
        billingCycle: "Year",
        createdOn: '10 Jan 2020',
        nextBillingDate: '09 Jan 2021',
        lastPaidOn: '10 Jan 2020',
        expiryDate: '10 Jan 2021',
        quantityBought: 5,
        quantityUsed: 2,
        statusText: 'Active',
        cssClass: 'is-success',
        fillPercent: '40%'
      },
      {
        id: 2,
        plan: {
          name: 'Per App',
          description: 'Consectetur ad est laborum consequat ex dolore amet exercitation nulla cupidatat labore ut. Officia sint proident laboris incididunt dolore esse cillum. Id commodo est dolor veniam aliquip.',
          isHighlighted: false,
          isActive: true,
          price: '156',
          currency: 'USD',
          quantity: 2,
          type: 0,
          expiryDuration: "1 Year",
          billingCycle: "1 Year",
          features: [
            {
              text: 'feature description <span class="highlighted"> one of many </span> in description',
              is_highlighted: false
            },
            {
              text: 'feature description <span class="highlighted"> one of many </span> in description',
              is_highlighted: true
            },
            {
              text: 'feature description <span class="highlighted"> one of many </span> in description',
              is_highlighted: false
            }
          ],
          isManualscanIncluded: false,
          manualscanCount: 0,
        },
        billingCycle: "month",
        createdOn: '10 Jan 2020',
        nextBillingDate: '09 Jan 2021',
        lastPaidOn: '10 Jan 2020',
        expiryDate: '10 Jan 2021',
        quantityBought: 1,
        quantityUsed: 1,
        statusText: 'Cancelled',
        cssClass: 'is-light',
        fillPercent: '100%'
      }
    ]
  },

  didInsertElement(){
    setTimeout(()=> {
      this.set('subscriptions',this.fetchSubscriptions());
      this.set('isLoading',false);
    },500);
  }
});
