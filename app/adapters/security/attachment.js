import ENV from 'irene/config/environment';
import DRFAdapter from 'irene/adapters/drf';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';

export default DRFAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: "api/hudson-api",
  addTrailingSlashes: false,

  _buildURL: function _buildURL(modelName, id) {
    if(id) {
      return `${this.get('host')}/${this.get('namespace')}/attachments/${id}`;
    }
    return `${this.get('host')}/${this.get('namespace')}/attachments`;
  }

});
