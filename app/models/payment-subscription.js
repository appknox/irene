import DS from "ember-data";
import { computed } from "@ember/object";

export default DS.Model.extend({
  // STATUS_ACTIVE: 0,
  // STATUS_CANCELLED: 1,
  // STATUS_EXPIRED: 2,
  // STATUS_INVALID_CARD: 3,
  // DEFAULT_STATUS: 4,
  statusTextList: ["Active", "Cancelled", "Expired", "Invalid Card", "Errored"],
  statusCSSClasses: {
    active: "is-success",
    canceled: "is-light",
    expired: "is-primary",
  },

  name: DS.attr("string"),
  description: DS.attr("string"),
  price: DS.attr("number"),
  currency: DS.attr("string"),
  createdOn: DS.attr("date"),
  canceledAt: DS.attr("date"),
  nextBillingDate: DS.attr("date"),
  lastPaidOn: DS.attr("date"),
  expiryDate: DS.attr("date"),
  billingCycle: DS.attr("string"),
  quantityRemaining: DS.attr("number"),
  quantityPurchased: DS.attr("number"),
  status: DS.attr("string"),
  plan: DS.attr(),
  availablePlans: DS.attr(),

  isMonthlySubscription: computed("billingCycle", function () {
    return this.get("billingCycle") === "month";
  }),

  quantityUsed: computed("quantityPurchased", "quantityRemaining", function () {
    return this.get("quantityPurchased") - this.get("quantityRemaining");
  }),

  fillPercent: computed("quantityPurchased", "quantityUsed", function () {
    return `${
      (this.get("quantityUsed") / this.get("quantityPurchased")) * 100
    }%`;
  }),

  statusText: computed("status", function () {
    let status = this.get("status");
    if (status === "canceled") {
      status = "cancelled";
    }
    const charArr = status.split("");
    const firstChar = charArr.shift();
    return `${firstChar.toUpperCase()}${charArr.join("")}`;
  }),

  statusCSSClass: computed("status", function () {
    let className = this.get("statusCSSClasses")[this.get("status")];
    if (!className) {
      className = this.get("statusCSSClasses")["expired"];
    }
    return className;
  }),

  isCancelled: computed("statusText", function () {
    return this.get("statusText") === this.get("statusTextList")[1];
  }),

  async cancel() {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    if (adapter) {
      await adapter.cancelSubscription(this.get("id"));
    }
  },

  async switch() {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    if (adapter) {
      await adapter.switchBillingCycle({
        id: this.get("id"),
        plan_id: this.get("plan"),
        quantity: this.get("quantityPurchased"),
      });
    }
  },
});
