import Component from "@ember/component";
import { task } from "ember-concurrency";
import { inject as service } from "@ember/service";

export default Component.extend({
  tagName: "",

  billingHelper: service("billing-helper"),

  redirectToPayment: task(function* () {
    const planId = this.get("plan.id");
    yield this.get("billingHelper").redirectToSubscriptionPayment(planId);
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
