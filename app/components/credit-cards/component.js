import Component from "@ember/component";
import PaginateMixin from "irene/mixins/paginate";
import { t } from "ember-intl";
import { task } from "ember-concurrency";
import { inject as service } from "@ember/service";

export default Component.extend(PaginateMixin, {
  tagName: "",
  targetModel: "credit-card",
  sortProperties: ["addedOn:desc"],

  disableActions: false,
  showRemoveConfirmation: false,
  showMarkDefaultConfirmation: false,
  selectedCardId: null,
  upperLimit: 8,
  lowerLimit: 0,

  addCardError: t("creditCards.notifications.addCard.error"),
  removeCardError: t("creditCards.notifications.removeCard.error"),
  removeCardSuceess: t("creditCards.notifications.removeCard.success"),
  markDefaultSuccess: t("creditCards.notifications.markAsDefault.success"),
  markDefaultError: t("creditCards.notifications.markAsDefault.success"),

  billingHelper: service("billing-helper"),
  notify: service("notification-messages"),

  redirectToAddCard: task(function* () {
    yield this.get("billingHelper").addCreditCard.call(
      this.get("billingHelper")
    );
  }),

  refetchRecords() {
    const refetchRequired =
      this.get("sortedObjects.length") === this.get("lowerLimit") ||
      this.get("sortedObjects.length") === this.get("upperLimit");
    if (refetchRequired) {
      this.incrementProperty("version");
    }
  },

  removeCard: task(function* () {
    try {
      const cardRecord = yield this.get("store").peekRecord(
        "credit-card",
        this.get("selectedCardId")
      );
      yield cardRecord.destroyRecord();
      this.refetchRecords();
      this.get("notify").success(this.get("removeCardSuceess"));
      this.set("showRemoveConfirmation", false);
    } catch (err) {
      this.get("notify").error(this.get("removeCardError"));
    } finally {
      this.set("disableActions", false);
    }
  }),

  markDefault: task(function* () {
    try {
      const cardRecord = yield this.get("store").peekRecord(
        "credit-card",
        this.get("selectedCardId")
      );
      yield cardRecord.get("markDefault").call(cardRecord);
      this.incrementProperty("version");
      this.get("notify").success(this.get("markDefaultSuccess"));
      this.set("showMarkDefaultConfirmation", false);
    } catch (err) {
      this.get("notify").error(this.get("markDefaultError"));
    } finally {
      this.set("disableActions", false);
    }
  }),

  actions: {
    initAddCard() {
      try {
        this.get("redirectToAddCard").perform();
      } catch (err) {
        this.get("notify").error(this.get("addCardError"));
      }
    },
    removeCard() {
      this.set("disableActions", true);
      this.get("removeCard").perform();
    },
    showRemoveConfirmation(cardId) {
      this.set("selectedCardId", cardId);
      this.set("showRemoveConfirmation", true);
    },
    showMarkDefaultConfirmation(cardId) {
      this.set("selectedCardId", cardId);
      this.set("showMarkDefaultConfirmation", true);
    },
    markDefault() {
      this.set("disableActions", true);
      this.get("markDefault").perform();
    },
  },
});
