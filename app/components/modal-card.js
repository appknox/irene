/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import Ember from 'ember';

const ModalCardComponent = Ember.Component.extend({

  isActive: false,
  classNames: ["modal"],
  classNameBindings: ['isActive:is-active'],
  layoutName: "components/modal-card",

  actions: {
    clearModal() {
      return this.set("isActive", false);
    }
  }
});

export default ModalCardComponent;
