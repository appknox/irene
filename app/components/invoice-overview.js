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
      const downloadUrl = this.get("invoice.downloadUrl");
      this.set("isDownloadingInvoice", true);
      const url = new URL(downloadUrl, ENV.host).href
      this.get("ajax").request(url)
      .then((result) => {
        if(!this.isDestroyed) {
          window.location = result.url;
          this.set("isDownloadingInvoice", false);
        }
      }, () => {
        this.set("isSavingStatus", false);
        this.get("notify").error("Sorry something went wrong, please try again");
      });
    }
  }
});

export default InvoiceOverviewComponent;
