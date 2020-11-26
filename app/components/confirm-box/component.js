import Component from '@ember/component';

const ConfirmBoxComponent = Component.extend({

  isActive: false,
  classNames: ["modal"],
  classNameBindings: ["isActive:is-active"],
  layoutName: "components/confirm-box",
  delegate: null,

  confirmAction(){},
  cancelAction(){},

  actions: {

    clearModal() {
      this.set("isActive", false);
      this.get("cancelAction")();
    },

    sendCallback() {
      const delegate = this.get("delegate");
      this.get("confirmAction")();
      if (delegate && delegate.confirmCallback) {
        delegate.confirmCallback(this.get("key"));
      }
    }
  }
});

export default ConfirmBoxComponent;
