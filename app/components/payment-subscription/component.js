import Component from "@ember/component";
import { t } from "ember-intl";
import { task } from "ember-concurrency";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";

export default Component.extend({
  tagName: "",
  isLoading: true,
  subscriptions: null,
  availableRecurringPlans: null,
  disableButtons: false,
  selectedId: null,
  showCancelConfirmation: false,

  _subscriptionSorting: ["createdOn:desc"],
  sortedSubscriptions: computed.sort("subscriptions", "_subscriptionSorting"),

  hasActiveSubscription: computed(
    "subscriptions.@each.isCancelled",
    function () {
      const activeSubscriptionsCount = this.get("subscriptions").reduce(
        this.activeSubscriptionReducer,
        0
      );
      return !!activeSubscriptionsCount;
    }
  ),

  notify: service("notification-messages"),
  billingHelper: service("billing-helper"),

  cancelSuccess: t("subscriptionCard.actions.cancel.success"),
  cancelError: t("subscriptionCard.actions.cancel.error"),

  activeSubscriptionReducer: (accumulator, currentObj) => {
    if (
      currentObj &&
      typeof currentObj.get === "function" &&
      !currentObj.get("isCancelled")
    ) {
      return ++accumulator;
    }
    return accumulator;
  },

  async fetchAvailableSubscriptions() {
    const availablePlans = await this.get("store")
      .peekAll("pricing-plan")
      .filter((plan) => {
        return plan.get("active") === true && plan.get("type") === 0;
      });
    this.set("availableRecurringPlans", availablePlans);
  },

  async fetchSubscriptions() {
    this.set("isLoading", true);
    const data = await this.get("store").findAll("payment-subscription");
    this.set("subscriptions", data);
    await this.fetchAvailableSubscriptions();
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
      subscription.set("status", "canceled");
      yield this.fetchSubscriptions();
    } catch (err) {
      this.get("notify").error(this.get("cancelError"));
    } finally {
      this.set("disableButtons", false);
    }
  }),

  actions: {
    initCheckout(plan) {
      this.set("billingHelper.selectedQuantity", 1);
      plan.set("isPaidUser", true);
      plan.set("showCheckoutModal", true);
    },
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
