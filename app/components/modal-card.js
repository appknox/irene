/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
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
