import Component from "@ember/component";
import { observer } from "@ember/object";
import { inject as service } from "@ember/service";

export default Component.extend({
  tagName: "",
  isLoading: true,
  addon: null,
  refreshCount: 0,
  response: null,

  billingHelper: service("billing-helper"),

  refreshCountChanged: observer("refreshCount", function () {
    this.updateAddonValues();
  }),

  updateAddonValues() {
    const {
      expiry_date: expiryDate,
      quantity,
      rescan_count: rescanCount,
      rescan_factor: rescanFactor,
      status,
      currency,
      price,
    } = this.get("response");
    this.set("addon.expiryDate", expiryDate);
    this.set("addon.quantity", quantity);
    this.set("addon.rescanCount", rescanCount);
    this.set("addon.rescanFactor", rescanFactor);
    this.set("addon.status", status);
    this.set("addon.currency", currency);
    this.set("addon.price", price);
  },

  async fetchAddons() {
    this.set("isLoading", true);
    const addonData = await this.get("store").findAll("payment-addon");
    this.set("addon", addonData.get("firstObject"));
    this.set("isLoading", false);
  },

  didInsertElement() {
    this.fetchAddons();
  },

  actions: {
    showCheckoutModal() {
      this.set("billingHelper.selectedQuantity", 1);
      this.set("addon.isPaidUser", true);
      this.set(
        "addon.requestType",
        this.get("billingHelper.purchaseType.addOn")
      );
      this.set("addon.showCheckoutModal", true);
    },
  },
});
