import Component from "@ember/component";
import { task } from "ember-concurrency";
import { inject as service } from "@ember/service";

export default Component.extend({
  tagName: "",

  billingHelper: service("billing-helper"),

  redirectToPayment: task(function* () {
    const isPaidUser = this.get("plan.isPaidUser");
    if (isPaidUser) {
      const type = this.get("plan.requestType");
      let response = null;
      switch (type) {
        case this.get("billingHelper.purchaseType.addOn"):
          response = yield this.get("billingHelper").buyAddOn();
          break;
        case this.get("billingHelper.purchaseType.oneTime"):
          response = yield this.get("billingHelper").buyOneTimeScan();
          break;
        default:
        // TODO: handle subscription payment
      }
      this.set("plan.showCheckoutModal", false);
      const context = this.get("context");
      if (context && response) {
        context.set("response", response);
        context.incrementProperty("refreshCount");
      }
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
