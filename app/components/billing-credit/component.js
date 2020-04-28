import Component from "@ember/component";

export default Component.extend({
  tagName: "",
  isLoading: true,
  orgCredit: null,

  async fetchCredits() {
    const orgCreditData = await this.get("store").findAll("billing-credit");
    this.set("orgCredit", orgCreditData);
    this.set("isLoading", false);
  },

  didInsertElement() {
    this.fetchCredits();
  },
});
