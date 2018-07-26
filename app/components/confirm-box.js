import Ember from 'ember';

const ConfirmBoxComponent = Ember.Component.extend({

  isActive: false,
  classNames: ["modal"],
  classNameBindings: ["isActive:is-active"],
  layoutName: "components/confirm-box",
  delegate: null,

  actions: {

    clearModal() {
      this.set("isActive", false);
    },

    sendCallback() {
      const delegate = this.get("delegate");
      delegate.confirmCallback(this.get("key"));
    }
  }
});

export default ConfirmBoxComponent;
