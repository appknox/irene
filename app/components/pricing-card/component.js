import Component from "@ember/component";
import { task } from "ember-concurrency";
import { inject as service } from "@ember/service";

export default Component.extend({
  tagName: "",
  showCheckoutModal: false,
  planId: null,
  quantity: 1,

  tempStore: service("local-storage"),
  notify: service("notification-messages"),

  getStripeSessionId: task(function*() {
    const defaultPlanQuantity = this.get("plan.quantity");
    if (defaultPlanQuantity) {
      this.set("quantity", defaultPlanQuantity);
    }
    const planCheckoutParams = {
      plan: this.get("planId"),
      quantity: this.get("quantity")
    };

    const stripeCheckoutSessionId = yield this.get(
      "plan.getStripeSessionId"
    ).call(this.get("plan"), planCheckoutParams);
    if (stripeCheckoutSessionId) {
      const stripe = window.Stripe(
        "pk_test_IMZbFpQo6Uavs7Q77Udp7E8u00c1dRKOsd"
      );
      if (!this.get("plan.isRecurring")) {
        const paymentData = {
          timestamp: Date.now()
        };
        try {
          yield this.get("tempStore").setData("ajs_bill_oneTime", paymentData);
        } catch (err) {
          this.get("notify").error(err.message);
          return null;
        }
      }
      stripe.redirectToCheckout({ sessionId: stripeCheckoutSessionId });
    }
    return null;
  }),

  actions: {
    openCheckoutModal() {
      this.set("planId", this.get("plan.id"));
      if (!this.get("plan").get("isRecurring")) {
        this.get("getStripeSessionId").perform();
        return;
      }
      this.set("showCheckoutModal", true);
    },
    incrementQuantity() {
      this.set("quantity", this.get("quantity") + 1);
    },
    decrementQuantity() {
      const currentQuantity = this.get("quantity");
      if (currentQuantity > 1) {
        this.set("quantity", currentQuantity - 1);
      }
      return;
    }
  }
});
