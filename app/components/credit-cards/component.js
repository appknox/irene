import Component from "@ember/component";
import PaginateMixin from "irene/mixins/paginate";
import { t } from "ember-intl";
import { task } from "ember-concurrency";
import { inject as service } from "@ember/service";

export default Component.extend(PaginateMixin, {
  tagName: "",
  targetModel: "credit-card",
  sortProperties: ["addedOn:desc"],

  addCardError: t("creditCards.notifications.addCard.error"),

  billingHelper: service("billing-helper"),
  notify: service("notification-messages"),

  redirectToAddCard: task(function* () {
    yield this.get("billingHelper").addCreditCard.call(
      this.get("billingHelper")
    );
  }),

  actions: {
    initAddCard() {
      try {
        this.get("redirectToAddCard").perform();
      } catch (err) {
        this.get("notify").error(this.get("addCardError"));
      }
    },
  },
});
