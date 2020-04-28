import Component from "@ember/component";
import { task } from "ember-concurrency";

export default Component.extend({
  tagName: "",
  isLoading: true,
  oneTime: null,
  currentQuantity: 0,

  fetchOnetimeData: task(function* () {
    const oneTimeData = yield this.get("store").findAll("payment-onetime");
    this.set("oneTime", oneTimeData.get("firstObject"));
    this.set("isLoading", false);
  }),

  didInsertElement() {
    this.get("fetchOnetimeData").perform();
  },

  actions: {
    openPaymentModal() {
      this.set("oneTime.isPaidUser", true);
      this.set("oneTime.showCheckoutModal", true);
    },
  },
});
