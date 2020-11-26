import Component from '@ember/component';

const ModalCardComponent = Component.extend({

  isActive: false,
  onCancel: null,
  classNames: ["modal"],
  classNameBindings: ['isActive:is-active'],
  layoutName: "components/modal-card",

  actions: {
    clearModal() {
      this.set("isActive", false);
      if (this.onCancel instanceof Function) {
        this.onCancel()
      }
    }
  }
});

export default ModalCardComponent;
