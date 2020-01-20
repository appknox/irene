import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  isLoading: true,
  invoices: null,

  fetchInvoices(){
    return [
      {
        id:1,
        invoiceId: "AB12345",
        createdOn: "10 JAN 2008"
      },
      {
        id:1,
        invoiceId: "Qw34567",
        createdOn: "12 FEB 2009"
      },
      {
        id:1,
        invoiceId: "SFG123345",
        createdOn: "13 MAR 2019"
      },
      {
        id:1,
        invoiceId: "ANT02345",
        createdOn: "25 JUL 2019"
      }

    ];
  },

  didInsertElement(){
    setTimeout(()=>{
      this.set('invoices',this.fetchInvoices());
      this.set('isLoading',false);
    },500);
  }

});
