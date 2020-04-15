import Component from "@ember/component";
import { inject as service } from "@ember/service";

const ModalCardComponent = Component.extend({
  isActive: false,
  onCancel: null,
  classNames: ["modal"],
  classNameBindings: ["isActive:is-active"],
  layoutName: "components/modal-card",
  isbillingModal: false,
  billingHelper: null,

  didInsertElement() {
    if (this.get("isbillingModal")) {
      this.set("billingHelper", service("billing-helper"));
      return;
    }
  },

  actions: {
    clearModal() {
      this.set("isActive", false);
      if (this.get("isbillingModal")) {
        this.get("billingHelper").closeCheckoutModal();
      }
      if (this.onCancel instanceof Function) {
        this.onCancel();
      }
    },
  },
});

export default ModalCardComponent;
