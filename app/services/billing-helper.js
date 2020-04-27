import Service from "@ember/service";
import { t } from "ember-intl";
import { inject as service } from "@ember/service";
import { getOwner } from "@ember/application";

export default Service.extend({
  selectedQuantity: 1,
  selectedPlanModel: null,
  tempStoreKeyPrefix: "ajs_bill_oneTime",
  cardStoreKeyPrefix: "ajs_bill_addCard",

  purchaseType: {
    addOn: "ADD_ON",
    oneTime: "ONE_TIME",
  },

  store: service(),
  router: service(),
  tempStore: service("local-storage"),
  stripeService: service("stripe-instance"),
  notify: service("notification-messages"),

  paymentSuccess: t("paymentSuccess"),
  paymentError: t("paymentFailed"),

  async setSelectedPlanModel(planId) {
    const planModel = await this.get("store").peekRecord(
      "pricing-plan",
      planId
    );
    this.set("selectedPlanModel", planModel);
  },

  getSubscriptionCheckoutParams() {
    const defaultPlanQuantity = this.get("selectedPlanModel.quantity");
    if (defaultPlanQuantity) {
      this.set("selectedQuantity", defaultPlanQuantity);
    }
    return {
      plan: this.get("selectedPlanModel.id"),
      quantity: this.get("selectedQuantity"),
    };
  },

  async openCheckoutModal(planId) {
    await this.setSelectedPlanModel(planId);
    const planModel = this.get("selectedPlanModel");
    planModel.set("showCheckoutModal", true);
  },

  closeCheckoutModal() {
    const planModel = this.get("selectedPlanModel");
    if (planModel) {
      planModel.set("showCheckoutModal", false);
      this.set("selectedQuantity", 1);
      return;
    }
  },

  async generateCheckoutSessionId(planId, checkoutParams) {
    await this.setSelectedPlanModel(planId);
    const sessionIDGetter = this.get("stripeService").getSessionId.bind(
      this.get("selectedPlanModel"),
      checkoutParams
    );
    const stripeCheckoutSessionId = await sessionIDGetter();
    return stripeCheckoutSessionId;
  },

  async redirectToAddCard(planId) {
    const stripeCheckoutSessionId = await this.generateCheckoutSessionId(
      planId
    );
    if (stripeCheckoutSessionId) {
      try {
        await this.setDataInLocalStore();
        this.get("stripeService").redirectToCheckout(stripeCheckoutSessionId);
      } catch (err) {
        this.get("notify").error(err.message);
      }
    }
  },

  async redirectToSubscriptionPayment(planId) {
    const planCheckoutParams = this.getSubscriptionCheckoutParams();
    const stripeCheckoutSessionId = await this.generateCheckoutSessionId(
      planId,
      planCheckoutParams
    );
    if (stripeCheckoutSessionId) {
      await this.clearDataInLocalStore();
      this.get("stripeService").redirectToCheckout(stripeCheckoutSessionId);
    }
  },

  incrementSelectedQuantity() {
    this.incrementProperty("selectedQuantity");
  },

  decrementSelectedQuantity() {
    const currentQuantity = this.get("selectedQuantity");
    if (currentQuantity > 1) {
      this.decrementProperty("selectedQuantity");
    }
  },

  async buyOneTimeScan() {
    const oneTimeModal = await this.get("store").queryRecord(
      "payment-onetime",
      {}
    );
    if (oneTimeModal) {
      try {
        const response = await oneTimeModal
          .get("buyScan")
          .call(oneTimeModal, this.get("selectedQuantity"));
        this.get("notify").success(this.get("paymentSuccess"));
        await this.clearDataInLocalStore();
        this.refreshRoute();
        return response;
      } catch (err) {
        this.get("notify").error(this.get("paymentError"));
      }
    }
  },

  async buyAddOn() {
    const addonModal = await this.get("store").queryRecord("payment-addon", {});
    if (addonModal) {
      try {
        const response = await addonModal
          .get("buyAddon")
          .call(addonModal, this.get("selectedQuantity"));
        this.get("notify").success(this.get("paymentSuccess"));
        return response;
      } catch (err) {
        this.get("notify").error(this.get("paymentError"));
      }
    }
  },

  async addCreditCard() {
    const firstCardRecord = await this.get("store").queryRecord(
      "credit-card",
      {}
    );
    const redirectToken = await firstCardRecord
      .get("sessionId")
      .call(firstCardRecord);
    if (redirectToken) {
      try {
        await this.setDataInLocalStore(this.get("cardStoreKeyPrefix"));
        this.get("stripeService").redirectToCheckout(redirectToken);
      } catch (err) {
        this.get("notify").error(err.message);
      }
    }
  },

  async setDataInLocalStore(prefixKey) {
    const storePrefixKey = prefixKey || this.get("tempStoreKeyPrefix");
    const paymentData = {
      timestamp: Date.now(),
    };
    await this.get("tempStore").setData(storePrefixKey, paymentData);
  },

  async clearDataInLocalStore(prefixKey) {
    const storePrefixKey = prefixKey || this.get("tempStoreKeyPrefix");
    await this.get("tempStore").clearData(storePrefixKey);
  },

  async checkLocalStoreHasData(prefixKey) {
    const storePrefixKey = prefixKey || this.get("tempStoreKeyPrefix");
    const data = await this.get("tempStore").getData(storePrefixKey);
    return !!data;
  },

  refreshRoute() {
    const currentRouteName = this.get("router.currentRouteName");
    const currentRouteInstance = getOwner(this).lookup(
      `route:${currentRouteName}`
    );
    currentRouteInstance.refresh();
  },
});
