/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import Ember from 'ember';

const ConfirmBoxComponent = Ember.Component.extend({

  isActive: false,
  classNames: ["modal"],
  classNameBindings: ["isActive:is-active"],
  layoutName: "components/confirm-box",
  delegate: null,

  actions: {

    clearModal() {
      return this.set("isActive", false);
    },

    sendCallback() {
      const delegate = this.get("delegate");
      return delegate.confirmCallback();
    }
  }
});

export default ConfirmBoxComponent;
