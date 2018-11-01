import Component from '@ember/component';

const ModalCardComponent = Component.extend({

  isActive: false,
  classNames: ["modal"],
  classNameBindings: ['isActive:is-active'],
  layoutName: "components/modal-card",

  actions: {
    clearModal() {
      this.set("isActive", false);
    }
  }
});

export default ModalCardComponent;
