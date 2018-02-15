import Ember from 'ember';
import ENV from 'irene/config/environment';

const InvoiceOverviewComponent = Ember.Component.extend({

  invoice: null,
  tagName:["tr"],

  actions: {
    getInvoiceLink() {
      const invoiceId = this.get("invoice.invoiceId");
      const url = [ENV.endpoints.invoices, invoiceId, ENV.endpoints.signedInvoiceUrl].join('/');
      const that = this;
      this.get("ajax").request(url)
      .then(result => window.open(result.data.url))
      .catch(function(error) {
        that.get("notify").error(error.payload.error);
      });
    }
  }
});

export default InvoiceOverviewComponent;
