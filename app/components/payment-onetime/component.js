import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  isLoading: true,
  oneTimes: null,

  fetchOnetimes(){
    return [
      {
        id: 1,
        plan: {
          name: 'Per Scan',
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
        createdOn: '10 Jan 2020',
        lastPaidOn: '10 Jan 2020',
        expiryDate: '10 Jan 2021',
        quantityBought: 5,
        quantityUsed: 2,
        statusText: 'Active',
        cssClass: 'is-success',
        scansLeft: 3
      },
      {
        id: 2,
        plan: {
          name: 'Per Scan',
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
        createdOn: '10 Jan 2020',
        lastPaidOn: '10 Jan 2020',
        expiryDate: '10 Jan 2021',
        quantityBought: 1,
        quantityUsed: 1,
        statusText: 'Expired',
        cssClass: 'is-light',
        scansLeft: 0
      }
    ]
  },

  didInsertElement(){
    setTimeout(()=> {
      this.set('oneTimes',this.fetchOnetimes());
      this.set('isLoading',false);
    },1000);
  }
});
