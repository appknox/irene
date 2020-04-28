import Component from "@ember/component";
import { t } from "ember-intl";
import { inject as service } from "@ember/service";

export default Component.extend({
  isSuccess: false,
  isError: false,
  showNotification: false,
  message: {
    success: null,
    error: null,
  },

  addCardSuccess: t("paymentAddCardSuccess"),
  addCardError: t("paymentAddCardFailed"),
  paymentSuccess: t("paymentSuccess"),
  paymentError: t("paymentFailed"),
  simpleAddCardSuccess: t("creditCards.notifications.addCard.success"),

  billingHelper: service("billing-helper"),

  async didInsertElement() {
    if (this.showNotification) {
      const hasLocalData = await this.get(
        "billingHelper"
      ).checkLocalStoreHasData();
      if (this.get("isPaymentMethodsAction")) {
        this.set("message", {
          success: this.get("simpleAddCardSuccess"),
          error: this.get("addCardError"),
        });
        return;
      } else if (hasLocalData) {
        this.set("message", {
          success: this.get("addCardSuccess"),
          error: this.get("addCardError"),
        });
        return;
      }
      this.set("message", {
        success: this.get("paymentSuccess"),
        error: this.get("paymentError"),
      });
    }
  },

  actions: {
    hideNotification() {
      this.set("showNotification", false);
    },
  },
});
