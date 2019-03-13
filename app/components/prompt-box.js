import Component from '@ember/component';

const PromptBoxComponent = Component.extend({

  isActive: false,
  classNames: ["modal"],
  classNameBindings: ["isActive:is-active"],
  layoutName: "components/prompt-box",
  inputValue: "",
  delegate: null,

  confirmAction(){},
  cancelAction(){},

  actions: {

    clearModal() {
      this.set("isActive", false);
      this.get("cancelAction")();
    },

    sendCallback() {
      const inputValue = this.get("inputValue");
      const delegate = this.get("delegate");
      this.get("confirmAction")(inputValue);
      if (delegate && delegate.promptCallback) {
        delegate.promptCallback(inputValue);
      }
    }
  }
});

export default PromptBoxComponent;
