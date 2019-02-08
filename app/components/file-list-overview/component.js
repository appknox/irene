import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  classNames: ['projectClassSelector:mp-plus:mp-minus'],
  projectClassSelector: false,
  showMoreDetails: false,
  actions: {
    toggleFileDetails() {
      this.set("projectClassSelector", this.get("showMoreDetails"));
      this.set("showMoreDetails", !this.get("showMoreDetails"));
    },

  }
});
