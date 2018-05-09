import Ember from 'ember';

export default Ember.Component.extend({

  tagName: "li",

  actions: {

    showMoreDetails() {
      this.set("readMoreDetails", true);
    },

    hideMoreDetails() {
      this.set("readMoreDetails", false);
    }
  }

});
