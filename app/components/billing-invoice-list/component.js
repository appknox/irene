import Component from "@ember/component";
import { task } from "ember-concurrency";
import { t } from "ember-intl";
import { inject as service } from "@ember/service";

export default Component.extend({
  tagName: "tr",

  notify: service("notification-messages-service"),
  tdownloadFailed: t("invoiceTable.notification.error"),

  downloadInvoice: task(function* (invoiceObject) {
    const downloadURL = yield invoiceObject
      .get("downloadUrl")
      .call(invoiceObject);
    if (downloadURL) {
      window.open(downloadURL);
      return;
    }
    this.get("notify").error(this.get("tdownloadFailed"));
  }),
});
