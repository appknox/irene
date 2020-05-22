import DRFAdapter from "./drf";
import ENV from "irene/config/environment";
import IreneAdapterMixin from "irene/mixins/data-adapter-mixin";
import { inject as service } from "@ember/service";

export default DRFAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  organization: service("organization"),

  _buildURL(moduleName, id) {
    const baseurl = `${this.get("host")}/${this.get(
      "namespace"
    )}/organizations/${
      this.get("organization").selected.id
    }/billing/subscriptions`;
    if (id) {
      return `${baseurl}/${encodeURIComponent(id)}`;
    }
    return baseurl;
  },

  cancelSubscription(id) {
    const endpoint = this._buildURL(null, id);
    return this.ajax(endpoint, "DELETE");
  },

  buy(data) {
    const endpoint = this._buildURL(null);
    return this.ajax(endpoint, "POST", { data });
  },
});
