/* eslint-disable ember/no-classic-components, ember/no-classic-classes, prettier/prettier, ember/require-tagless-components, ember/no-actions-hash */
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
