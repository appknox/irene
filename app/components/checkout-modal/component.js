import Component from "@ember/component";
import { task } from "ember-concurrency";
import { inject as service } from "@ember/service";

export default Component.extend({
  tagName: "",

  billingHelper: service("billing-helper"),

  redirectToPayment: task(function* () {
    const isPaidUser = this.get("plan.isPaidUser");
    if (isPaidUser) {
      yield this.get("billingHelper").buyOneTimeScan();
      this.set("plan.showCheckoutModal", false);
      this.set("plan.refreshCount", this.get("plan.refreshCount") + 1);
      return;
    }
    const planId = this.get("plan.id");
    if (planId) {
      yield this.get("billingHelper").redirectToSubscriptionPayment(planId);
      return;
    }
  }),

  actions: {
    redirectToPayment() {
      this.get("redirectToPayment").perform();
    },
    decrementQuantity() {
      this.get("billingHelper").decrementSelectedQuantity();
    },
    incrementQuantity() {
      this.get("billingHelper").incrementSelectedQuantity();
    },
  },
});
