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
    }/billing/creditcards`;
    if (id) {
      return `${baseurl}/${encodeURIComponent(id)}`;
    }
    return baseurl;
  },

  getStripeSessionId: function () {
    const creditCardSessionUrl = this._buildURL();
    return this.ajax(creditCardSessionUrl, "POST", {});
  },

  markAsDefault: function (id) {
    const baseUrl = this._buildURL(null, id);
    const endpoint = `${baseUrl}/mark_as_default`;
    return this.ajax(endpoint, "POST", {});
  },
});
