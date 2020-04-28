import Component from "@ember/component";
import { task } from "ember-concurrency";
import { inject as service } from "@ember/service";

export default Component.extend({
  tagName: "",

  billingHelper: service("billing-helper"),

  redirectToAddCard: task(function* () {
    yield this.get("billingHelper").redirectToAddCard.call(
      this.get("billingHelper"),
      this.get("plan.id")
    );
  }),

  openCheckoutModal: task(function* () {
    yield this.get("billingHelper").openCheckoutModal.call(
      this.get("billingHelper"),
      this.get("plan.id")
    );
  }),

  actions: {
    initCheckout() {
      if (this.get("plan.isRecurring")) {
        this.get("openCheckoutModal").perform();
        return;
      }
      this.get("redirectToAddCard").perform();
    },
  },
});
