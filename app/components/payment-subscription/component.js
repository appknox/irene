import Component from "@ember/component";
import { t } from "ember-intl";
import { task } from "ember-concurrency";
import { inject as service } from "@ember/service";

export default Component.extend({
  tagName: "",
  isLoading: true,
  subscriptions: null,
  disableButtons: false,
  selectedId: null,
  showCancelConfirmation: false,

  notify: service("notification-messages"),

  cancelSuccess: t("subscriptionCard.actions.cancel.success"),
  cancelError: t("subscriptionCard.actions.cancel.error"),

  async fetchSubscriptions() {
    this.set("isLoading", true);
    const data = await this.get("store").findAll("payment-subscription");
    this.set("subscriptions", data);
    this.set("isLoading", false);
  },

  didInsertElement() {
    this.fetchSubscriptions();
  },

  cancelSubscription: task(function* () {
    try {
      const subscription = yield this.get("store").peekRecord(
        "payment-subscription",
        this.get("selectedId")
      );
      yield subscription.cancel.call(subscription);
      this.get("notify").success(this.get("cancelSuccess"));
      this.set("showCancelConfirmation", false);
      this.fetchSubscriptions();
    } catch (err) {
      this.get("notify").error(this.get("cancelError"));
    } finally {
      this.set("disableButtons", false);
    }
  }),

  actions: {
    showCancelConfirmation(id) {
      this.set("selectedId", id);
      this.set("showCancelConfirmation", true);
    },
    cancelSubscription() {
      this.set("disableButtons", true);
      this.get("cancelSubscription").perform();
    },
  },
});
