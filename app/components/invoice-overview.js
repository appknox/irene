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
      this.set("isDownloadingInvoice", true);
      this.get("ajax").request(url)
      .then((result) => {
        if(!this.isDestroyed) {
          window.location = result.url;
          this.set("isDownloadingInvoice", false);
        }
      }, (error) => {
        this.set("isSavingStatus", false);
        this.get("notify").error(error.payload.message);
      });
    }
  }
});

export default InvoiceOverviewComponent;
