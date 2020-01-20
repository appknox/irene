import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  isLoading: true,
  addons: null,

  fetchAddons(){
    return [
      {
        id: 1,
        addon: {
          name: 'Manual Scan',
          description: 'Consectetur ad est laborum consequat ex dolore amet exercitation nulla cupidatat labore ut. Officia sint proident laboris incididunt dolore esse cillum. Id commodo est dolor veniam aliquip.',
          price: '720',
          currency: 'USD',
        },
        createdOn: '10 Jan 2020',
        lastPaidOn: '10 Jan 2020',
        expiryDate: '10 Jan 2021',
        scansPurchased: 5,
        scansRemaining: 2,
        rescansPurchased: 2,
        rescansRemaining: 2,
        statusText: 'Active',
        cssClass: 'is-success',
      },
      {
        id: 2,
        addon: {
          name: 'Manual Scan',
          description: 'Consectetur ad est laborum consequat ex dolore amet exercitation nulla cupidatat labore ut. Officia sint proident laboris incididunt dolore esse cillum. Id commodo est dolor veniam aliquip.',
          price: '520',
          currency: 'USD',
        },
        createdOn: '10 Jan 2020',
        lastPaidOn: '10 Jan 2020',
        expiryDate: '10 Jan 2021',
        scansPurchased: 4,
        scansRemaining: 1,
        rescansPurchased: 0,
        rescansRemaining: 0,
        statusText: 'Expired',
        cssClass: 'is-light',
      },
    ]
  },

  didInsertElement(){
    setTimeout(()=> {
      this.set('addons',this.fetchAddons());
      this.set('isLoading',false);
    },1500);
  }
});
