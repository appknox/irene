import DS from "ember-data";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";

export default DS.Model.extend({
  logger: service("rollbar"),

  name: DS.attr("string"),
  active: DS.attr("boolean"),
  description: DS.attr("string"),
  isHighlighted: DS.attr("boolean"),
  price: DS.attr("string"),
  currency: DS.attr("string"),
  quantity: DS.attr("number"),
  type: DS.attr("number"),
  expiryDuration: DS.attr("string"),
  billingCycle: DS.attr("string"),
  features: DS.attr(),
  isManualscanIncluded: DS.attr("boolean"),
  manualscanCount: DS.attr("number"),

  showCheckoutModal: false,

  allowQuantityInput: computed("quantity", function () {
    return !this.get("quantity");
  }),

  isRecurring: computed("billingCycle", function () {
    return !!this.get("billingCycle");
  }),

  async getStripeSessionId(data) {
    const isRecurring = this.get("isRecurring");
    const adapter = isRecurring
      ? this.store.adapterFor("pricing-plan")
      : this.store.adapterFor("credit-card");
    let sessionId = null;
    try {
      const response = isRecurring
        ? await adapter.getStripeSessionId(data)
        : await adapter.getStripeSessionId();
      if (response && response.id) {
        sessionId = response.id;
      }
      return sessionId;
    } catch (err) {
      return sessionId;
    }
  },

  async buySubscription(quantity) {
    const adapter = this.store.adapterFor("payment-subscription");
    if (adapter) {
      const params = {
        plan_id: this.get("id"),
        quantity,
      };
      return await adapter.buy(params);
    }
  },
});
