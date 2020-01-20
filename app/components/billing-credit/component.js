import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  isLoading: true,
  orgCredit: null,

  fetchCredits(){
    return{
      credits: 680,
      currency: "USD",
      updatedOn: "10 Jan 2020"
    };
  },

  didInsertElement(){
    setTimeout(()=>{
      this.set('orgCredit',this.fetchCredits());
      this.set('isLoading', false);
    },400);
  }
});

