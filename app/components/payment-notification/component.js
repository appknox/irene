import Component from "@ember/component";

export default Component.extend({
  message: "",
  isSuccess: false,
  isError: false,
  showNotification: false,
  actions: {
    hideNotification() {
      this.set("showNotification", false);
    }
  }
});
