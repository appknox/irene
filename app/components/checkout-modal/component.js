import Component from "@ember/component";
import { task } from "ember-concurrency";
import { inject as service } from "@ember/service";

export default Component.extend({
  tagName: "",

  billingHelper: service("billing-helper"),

  redirectToPayment: task(function* () {
    const isPaidUser = this.get("plan.isPaidUser");
    const context = this.get("context");
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
        case this.get("billingHelper.purchaseType.subscriptionAddon"):
          response = yield this.get("billingHelper").addMoreToSubscription(
            this.get("plan.id")
          );
          break;
        default:
          response = yield this.get("billingHelper").buySubscription(
            this.get("plan.id")
          );
      }
      this.set("plan.showCheckoutModal", false);
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
