import DS from "ember-data";
import { computed } from "@ember/object";

export default DS.Model.extend({
  DEFAULT_STATUS: 2,
  statusTextList: ["Active", "Expired", "Errored"],
  statusCSSClasses: ["is-success", "is-light", "is-primary"],

  expiryDate: DS.attr("date"),
  quantity: DS.attr("number"),
  rescanCount: DS.attr("number"),
  rescanFactor: DS.attr("number"),
  status: DS.attr("number"),
  currency: DS.attr("string"),
  price: DS.attr("number"),

  statusText: computed("status", function () {
    const subscriptionStatusValue = this.get("status");
    const subscriptionText = this.get("statusTextList")[
      subscriptionStatusValue
    ];
    return subscriptionText
      ? subscriptionText
      : this.get("statusTextList")[this.get("DEFAULT_STATUS")];
  }),

  showBuyOption: computed("quantity", "expiryDate", function () {
    return this.get("quantity") === 0 && this.get("expiryDate") === null;
  }),

  showReActivateOption: computed("quantity", "expiryDate", function () {
    return (
      this.get("quantity") > 0 &&
      this.get("expiryDate") !== null &&
      this.get("expiryDate") < Date.now()
    );
  }),

  statusCSSClass: computed("status", function () {
    return this.get("statusCSSClasses")[this.get("status")];
  }),

  showNoData: computed("price", "currency", function () {
    return this.get("price") === null && this.get("currency") === null;
  }),

  async buyAddon(quantity) {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    if (adapter) {
      const params = {
        quantity,
        price: this.get("price"),
        currency: this.get("currency"),
      };
      const response = await adapter.buyAddon(params);
      return response;
    }
  },
});
