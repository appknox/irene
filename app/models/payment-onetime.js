import DS from "ember-data";
import { computed } from "@ember/object";

export default DS.Model.extend({
  DEFAULT_STATUS: 2,
  statusTextList: ["Active", "Expired", "Errored"],
  statusCSSClasses: ["is-success", "is-light", "is-primary"],

  expiryDate: DS.attr("date"),
  quantity: DS.attr("number"),
  currency: DS.attr("string"),
  price: DS.attr("number"),
  status: DS.attr("number"),

  statusText: computed("status", function () {
    const subscriptionStatusValue = this.get("status");
    const subscriptionText = this.get("statusTextList")[
      subscriptionStatusValue
    ];
    return subscriptionText
      ? subscriptionText
      : this.get("statusTextList")[this.get("DEFAULT_STATUS")];
  }),

  showBuyOption: computed("quantity", function () {
    return this.get("quantity") === 0;
  }),

  statusCSSClass: computed("status", function () {
    return this.get("statusCSSClasses")[this.get("status")];
  }),

  async buyScan(quantity) {
    const data = {
      price: this.get("price"),
      currency: this.get("currency"),
      quantity,
    };
    const adapter = this.store.adapterFor(this.constructor.modelName);
    await adapter.buyOneTimeScan(data);
  },
});
