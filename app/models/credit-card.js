import DS from "ember-data";

export default DS.Model.extend({
  brand: DS.attr("string"),
  addedOn: DS.attr("date"),
  lastFour: DS.attr("number"),
  expirationMonth: DS.attr("number"),
  expirationYear: DS.attr("number"),
  isDefault: DS.attr("boolean"),

  async sessionId() {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    let token = null;
    try {
      const response = await adapter.getStripeSessionId();
      if (response && response.id && response.id.length) {
        token = response.id;
        return token;
      }
    } catch (err) {
      throw new Error(err.message);
    }
    return token;
  },

  async markDefault() {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    return await adapter.markAsDefault(this.get("id"));
  },
});
