import Ember from 'ember';
import ENV from 'irene/config/environment';

const InvoiceOverviewComponent = Ember.Component.extend({

  invoice: null,
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),
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
        if(!that.isDestroyed) {
          window.location = result.url;
          that.set("isDownloadingInvoice", false);
        }
      })
      .catch(function(error) {
        if(!that.isDestroyed) {
          that.set("isDownloadingInvoice", false);
          that.get("notify").error(error.payload.error);
        }
      });
    }
  }
});

export default InvoiceOverviewComponent;
