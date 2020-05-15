import DS from "ember-data";

const UploadApp = DS.Model.extend({
  url: DS.attr("string"),
  fileKey: DS.attr("string"),
  fileKeySigned: DS.attr("string"),
  submissionId: DS.attr("number"),

  async saveWithPlanFlag() {
    const adapter = await this.store.adapterFor(this.constructor.modelName);
    if (adapter) {
      const params = {
        file_key: this.get("fileKey"),
        file_key_signed: this.get("fileKeySigned"),
        is_per_app: this.get("isPerApp"),
      };
      await adapter.saveWithPlanFlag(this.constructor.modelName, params);
    }
  },
});

export default UploadApp;
