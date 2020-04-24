import ENV from "irene/config/environment";
import Service from "@ember/service";
import { inject as service } from "@ember/service";

export default Service.extend({
  notify: service("notification-messages"),

  token: ENV.stripePublicKey,
  instance: null,

  init() {
    this._super(...arguments);
    if (this.get("instance") === null) {
      const STRIPE_INSTANCE = window.Stripe(this.get("token"));
      this.set("instance", STRIPE_INSTANCE);
    }
  },

  getInstance() {
    return this.get("instance");
  },

  async getSessionId(params) {
    return await this.get("getStripeSessionId").call(this, params);
  },

  redirectToCheckout(sessionId) {
    return this.get("instance").redirectToCheckout({
      sessionId,
    });
  },
});
