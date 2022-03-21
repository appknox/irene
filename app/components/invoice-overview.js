/* eslint-disable ember/no-classic-components, ember/no-classic-classes, prettier/prettier, ember/avoid-leaking-state-in-ember-objects, ember/no-actions-hash, ember/no-get */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';

const InvoiceOverviewComponent = Component.extend({

  invoice: null,
  ajax: service(),
  notify: service('notifications'),
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
