import Component from "@ember/component";
import { task } from "ember-concurrency";
import { inject as service } from "@ember/service";

export default Component.extend({
  tagName: "",
  showCheckoutModal: false,
  planId: null,
  quantity: 1,
  tempStoreKeyPrefix: "ajs_bill_oneTime",

  tempStore: service("local-storage"),
  stripeService: service("stripe-instance"),
  notify: service("notification-messages"),

  getStripeSessionId: task(function* () {
    const defaultPlanQuantity = this.get("plan.quantity");
    if (defaultPlanQuantity) {
      this.set("quantity", defaultPlanQuantity);
    }
    const planCheckoutParams = {
      plan: this.get("planId"),
      quantity: this.get("quantity"),
    };

    const sessionIDGetter = this.get("stripeService").getSessionId.bind(
      this.get("plan"),
      planCheckoutParams
    );
    const stripeCheckoutSessionId = yield sessionIDGetter();

    if (stripeCheckoutSessionId) {
      try {
        if (!this.get("plan.isRecurring")) {
          const paymentData = {
            timestamp: Date.now(),
          };
          yield this.get("tempStore").setData(
            this.get("tempStoreKeyPrefix"),
            paymentData
          );
        } else {
          yield this.get("tempStore").clearData(this.get("tempStoreKeyPrefix"));
        }
      } catch (err) {
        this.get("notify").error(err.message);
        return null;
      }

      this.get("stripeService").redirectToCheckout(stripeCheckoutSessionId);
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
    },
  },
});
