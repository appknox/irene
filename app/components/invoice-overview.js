import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const InvoiceOverviewComponent = Component.extend({
  i18n: service(),
  invoice: null,
  ajax: service(),
  notify: service('notification-messages-service'),
  tagName:["tr"],
  tSomethingWentWrong: t("somethingWentWrong"),

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
        this.get("notify").error(this.get("tSomethingWentWrong"));
      });
    }
  }
});

export default InvoiceOverviewComponent;
