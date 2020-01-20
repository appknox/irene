import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  isLoading: true,
  cards: null,

  fetchCreditCards(){
    return [
      {
        id: 1,
        createdOn: "10 Jan 2017",
        lastFour: "4242",
        cardCompany: "Visa",
        expirationMonth: "02",
        expirationYear: "2021",
        statusText: "Active",
      },
      {
        id: 2,
        createdOn: "14 Mar 2017",
        lastFour: "5287",
        cardCompany: "Master",
        expirationMonth: "04",
        expirationYear: "2019",
        statusText: "Expired",
      },
      {
        id: 3,
        createdOn: "17 Jan 2017",
        lastFour: "3242",
        cardCompany: "Visa",
        expirationMonth: "09",
        expirationYear: "2028",
        statusText: "Blocked",
      }
    ];
  },

  didInsertElement(){
    setTimeout(()=>{
      this.set('cards', this.fetchCreditCards());
      this.set('isLoading', false);
    },500)
  }
});
