import Component from "@ember/component";
import { observer } from "@ember/object";
import { task } from "ember-concurrency";
import { inject as service } from "@ember/service";

export default Component.extend({
  tagName: "",
  isLoading: true,
  oneTime: null,
  refreshCount: 0,
  response: null,

  billingHelper: service("billing-helper"),

  refreshCountChanged: observer("refreshCount", function () {
    this.updateOnetimeData();
  }),

  updateOnetimeData() {
    const {
      expiry_date: expiryDate,
      quantity,
      currency,
      price,
      status,
    } = this.get("response");
    this.set("oneTime.expiryDate", expiryDate);
    this.set("oneTime.quantity", quantity);
    this.set("oneTime.currency", currency);
    this.set("oneTime.price", price);
    this.set("oneTime.status", status);
  },

  fetchOnetimeData: task(function* () {
    this.set("isLoading", true);
    const oneTimeData = yield this.get("store").findAll("payment-onetime");
    this.set("oneTime", oneTimeData.get("firstObject"));
    this.set("isLoading", false);
  }),

  didInsertElement() {
    this.get("fetchOnetimeData").perform();
  },

  actions: {
    openPaymentModal() {
      this.set("billingHelper.selectedQuantity", 1);
      this.set("oneTime.isPaidUser", true);
      this.set(
        "oneTime.requestType",
        this.get("billingHelper.purchaseType.oneTime")
      );
      this.set("oneTime.showCheckoutModal", true);
    },
  },
});
