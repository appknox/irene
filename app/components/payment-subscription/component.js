import Component from "@ember/component";
import { t } from "ember-intl";
import { task } from "ember-concurrency";
import { computed } from "@ember/object";
import { observer } from "@ember/object";
import { inject as service } from "@ember/service";

export default Component.extend({
  tagName: "",
  isLoading: true,
  subscriptions: null,
  availableRecurringPlans: null,
  disableButtons: false,
  selectedId: null,
  refreshCount: 0,
  selectedSubscriptionObject: {
    showCheckoutModal: false,
  },
  showCancelConfirmation: false,
  showMonthlySwitchConfirmation: false,
  showYearlySwitchConfirmation: false,

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
  switchMonthlySuccess: t("subscriptionCard.actions.switchToMonthly.success"),
  switchMonthlyError: t("subscriptionCard.actions.switchToMonthly.error"),
  switchYearlySuccess: t("subscriptionCard.actions.switchToYearly.success"),
  switchYearlyError: t("subscriptionCard.actions.switchToYearly.error"),

  refreshCountChanged: observer("refreshCount", function () {
    this.fetchSubscriptions();
  }),

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
      this.incrementProperty("refreshCount");
    } catch (err) {
      this.get("notify").error(this.get("cancelError"));
    } finally {
      this.set("disableButtons", false);
    }
  }),

  switchBillingCycle: task(function* (switchTo) {
    try {
      const subscription = yield this.get("store").peekRecord(
        "payment-subscription",
        this.get("selectedId")
      );
      yield subscription.switch.call(subscription);
      if (switchTo === "monthly") {
        this.get("notify").success(this.get("switchMonthlySuccess"));
        this.set("showMonthlySwitchConfirmation", false);
      } else {
        this.get("notify").success(this.get("switchYearlySuccess"));
        this.set("showYearlySwitchConfirmation", false);
      }
      this.incrementProperty("refreshCount");
    } catch (err) {
      if (switchTo === "monthly") {
        this.get("notify").error(this.get("switchMonthlyError"));
      } else {
        this.get("notify").error(this.get("switchYearlyError"));
      }
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
    showMonthlySwitchConfirmation(id) {
      this.set("selectedId", id);
      this.set("showMonthlySwitchConfirmation", true);
    },
    showYearlySwitchConfirmation(id) {
      this.set("selectedId", id);
      this.set("showYearlySwitchConfirmation", true);
    },
    cancelSubscription() {
      this.set("disableButtons", true);
      this.get("cancelSubscription").perform();
    },
    switchToMonthly() {
      this.set("disableButtons", true);
      this.get("switchBillingCycle").perform("monthly");
    },
    switchToYearly() {
      this.set("disableButtons", true);
      this.get("switchBillingCycle").perform("yearly");
    },
    openAddMoreModal(subscription) {
      this.set("billingHelper.selectedQuantity", 1);
      subscription.set("isPaidUser", true);
      subscription.set(
        "requestType",
        this.get("billingHelper.purchaseType.subscriptionAddon")
      );
      subscription.set("showCheckoutModal", true);
      this.set("selectedSubscriptionObject", subscription);
    },
  },
});
