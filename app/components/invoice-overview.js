/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
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
      return this.get("ajax").request(url)
      .then(result => window.open(result.data.url)).catch(error =>
        (() => {
          const result = [];
          for (error of Array.from(error.errors)) {
            result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
          }
          return result;
        })()
      );
    }
  }
});

export default InvoiceOverviewComponent;
