import Service from "@ember/service";
import { inject as service } from "@ember/service";

export default Service.extend({
  selectedQuantity: 1,
  selectedPlanModel: null,
  tempStoreKeyPrefix: "ajs_bill_oneTime",

  store: service(),
  tempStore: service("local-storage"),
  stripeService: service("stripe-instance"),
  notify: service("notification-messages"),

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
    planModel.set("showCheckoutModal", false);
    this.set("selectedQuantity", 1);
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
      } catch (err) {
        this.get("notify").error(err.message);
      }
    }
    this.get("stripeService").redirectToCheckout(stripeCheckoutSessionId);
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
    this.set("selectedQuantity", this.get("selectedQuantity") + 1);
  },

  decrementSelectedQuantity() {
    const currentQuantity = this.get("selectedQuantity");
    if (currentQuantity > 1) {
      this.set("selectedQuantity", currentQuantity - 1);
    }
  },

  async setDataInLocalStore() {
    const paymentData = {
      timestamp: Date.now(),
    };
    await this.get("tempStore").setData(
      this.get("tempStoreKeyPrefix"),
      paymentData
    );
  },

  async clearDataInLocalStore() {
    await this.get("tempStore").clearData(this.get("tempStoreKeyPrefix"));
  },
});
