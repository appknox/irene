import DS from "ember-data";
import { inject as service } from "@ember/service";

export default DS.Model.extend({
  logger: service("rollbar"),

  amount: DS.attr("number"),
  created: DS.attr("date"),
  status: DS.attr("string"),
  currency: DS.attr("string"),

  async downloadUrl() {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    try {
      const response = await adapter.getDownloadUrl(this.get("id"));
      if (response && response.url && response.url.length) {
        return response.url;
      }
    } catch (err) {
      this.get("logger").error("Download Invoice URL network call failed", err);
    }
    return "";
  },
});
