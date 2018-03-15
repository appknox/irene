import Ember from 'ember';

const PromptBoxComponent = Ember.Component.extend({

  isActive: false,
  classNames: ["modal"],
  classNameBindings: ["isActive:is-active"],
  layoutName: "components/prompt-box",
  inputValue: "",
  delegate: null,

  actions: {

    clearModal() {
      this.set("isActive", false);
    },

    sendCallback() {
      const inputValue = this.get("inputValue");
      const delegate = this.get("delegate");
      delegate.promptCallback(inputValue);
    }
  }
});

export default PromptBoxComponent;
