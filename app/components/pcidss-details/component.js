import Component from '@ember/component';

export default Component.extend({

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
