import Component from "@ember/component";
import { inject as service } from "@ember/service";

export default Component.extend({
  tagName: "",
  billingHelper: service("billing-helper"),

  async removeCardAdditionData() {
    await this.get("billingHelper").clearDataInLocalStore.call(
      this.get("billingHelper"),
      this.get("billingHelper").cardStoreKeyPrefix
    );
  },

  init() {
    this._super(...arguments);
    this.removeCardAdditionData();
  },
});
