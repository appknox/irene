import Component from "@ember/component";
import PaginateMixin from "irene/mixins/paginate";
import { task } from "ember-concurrency";
import { t } from "ember-intl";
import { inject as service } from "@ember/service";

export default Component.extend(PaginateMixin, {
  tagName: "",
  targetModel: "billing-invoice",
  sortProperties: ["created:desc"],

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
