import Ember from 'ember';
import ENV from 'irene/config/environment';

const InvoiceOverviewComponent = Ember.Component.extend({

  invoice: null,
  tagName:["tr"],

  isDownloadingInvoice: false,

  actions: {
    getInvoiceLink() {
      const invoiceId = this.get("invoice.invoiceId");
      const url = [ENV.endpoints.invoices, invoiceId, ENV.endpoints.signedInvoiceUrl].join('/');
      const that = this;
      this.set("isDownloadingInvoice", true);
      this.get("ajax").request(url)
      .then(function(result){
        window.location = result.url;
        that.set("isDownloadingInvoice", false);
      })
      .catch(function(error) {
        that.set("isDownloadingInvoice", false);
        that.get("notify").error(error.payload.error);
      });
    }
  }
});

export default InvoiceOverviewComponent;
